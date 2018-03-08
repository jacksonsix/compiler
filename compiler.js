//compile code to machine level
//compiler
// linkage  continue = next,  return = return to caller , jump = jump to label
// instruction sequence as a abstract object

function new_label_counter(){
		var count = 0;
		return function(){
			count++;
		}
}
//
function compile(exp ,target, linkage){
	var type = getType(exp);
	switch(type){
		case 'self':
			compile_self(exp,target,linkage);
			break;
		case 'quoted':	
			compile_quoted(exp,target,linkage);
			break;	
		case 'variable':	
			compile_variable(exp,target,linkage);
			break;	
		case 'assignment':	
			compile_assignment(exp,target,linkage);
			break;	
		case 'definition':	
			compile_definition(exp,target,linkage);
			break;	
		case 'if_exp':	
			compile_if(exp,target,linkage);
			break;	
		case 'lambda':	
			compile_lambda(exp,target,linkage);
			break;	
		case 'begin':	
			compile_begin(exp,target,linkage);
			break;	
		case 'application':	
			compile_application(exp,target,linkage);
			break;				
        default:
            trace('Unknown expression !');
            break;			
	}
}

function getType(exp){
	return exp.type;
}


function compile_linkage(linkage){
	var result ;
	if(linkage ==='return'){
		result = make_instruction_sequence(['continue'],[],['(goto (reg continue))']);
	}else if(linkage ==='next'){
		result =  empty_instruction_sequence();
	}else{
		result = make_instruction_sequence([],[],['(goto (label linkage))']);
	}
	return result;
}

function end_with_linkage(linkage, instructions){
	return preserving(['continue'] 
	                 ,instructions
					 ,compile_linkage(linkage));
}

function compile_self(exp ,target, linkage){
	return end_with_linkage(linkage
	                            ,make_instruction_sequence([]
								                                             ,[target]
																			 ,['(assign ' + target + '(const ' + exp + '))']));
}

function compile_quoted(exp ,target, linkage){
	return end_with_linkage(linkage
	                            ,make_instruction_sequence([]
								                                             ,[target]
																			 ,['(assign ' + target + '(const ' + '(quote_text ' + exp+')' + '))']));
}

function compile_variable(exp ,target, linkage){
	return end_with_linkage(linkage
	                            ,make_instruction_sequence(['env']
								                                             ,[target]
																			 ,['(assign '+target+' (op lookup_var_env) (const '+exp+') (reg env))']));
}

function compile_assignment(exp ,target, linkage){
	var variable = assign_variable(exp);
	var get_value_code = compile(assign_value(exp),'val','next');
	
	return end_with_linkage(linkage
	                            ,preserving(['env']
								                  ,get_value_code
								                  ,make_instruction_sequence(['env','val']
								                                             ,[target]
																			 ,['(perform (op set_var_value) (const '+variable+') (reg val) (reg env))',
																			   '(assign '+target+' (const ok))'])));
}

function compile_definition(exp ,target, linkage){
	var variable = define_var(exp);
	var get_value_code = compile(define_value(exp),'val','next');
	
	return end_with_linkage(linkage
	                            ,preserving(['env']
								                  ,get_value_code
								                  ,make_instruction_sequence(['env','val']
								                                             ,[target]
																			 ,['(perform (op define_variable) (const '+variable+') (reg val) (reg env))',
																			   '(assign '+target+' (const ok))'])));
}

function compile_if(exp,target,linkage){
	var label_counter = new_label_counter()();
	var t_branch = make_label('true_branch' +label_counter);
	var f_branch = make_label('false_branch'+label_counter);
	var after_if = make_label('after_if'+label_counter);
	
	var conseq_linkage =  linkage ==='next'? after_if :linkage;
	var p_code = compile(if_pred(exp),'val','next');
    var c_code = compile(if_conseq(exp),target,conseq_linkage);
    var a_code = compile(if_alt(exp),target,conseq_linkage);

 	return preserving(['env','continue']
					,p_code
					,append_instruction_sequence(make_instruction_sequence(['val']
																												  ,[]
																												  ,[ '(test (op false?) (reg val))'
																													  ,'(branch (label f_branch))'])
					                                                      ,parallel_instruction_sequence(append_instruction_sequence( t_branch,c_code)
																	                                                      ,append_instruction_sequence(f_branch,a_code))
																		  ,after_if));
																		  
}

function compile_sequence(sequence,target,linkage){
	var code;
	if(is_last_exp(seq)){
		code = compile(first_sequence(sequence),target,linkage);
	}else{
		code = preserving(['env','continue']
		                             ,compile(first_sequence(sequence),target,'next')
									 ,compile_sequence(rest_sequence(sequence), target,linkage));
	}
	return code;
}

//
function make_compiled_proc(entry,env){
	var proc = {
		type:'compiled_procedure',
		entry:entry,
		env:env
	};
	return proc;
}
function get_compiled_proc_entry(proc){
	return proc.entry;
}
function get_compiled_proc_env(proc){
	return proc.env;
}
//
function compile_lambda(exp,target,linkage){
	var label_counter = new_label_counter()();
	var proc_entry = make_label('entry'+label_counter);
	var after_lambda = make_label('after_lambda'+label_counter);
	var lambda_linkage = linkage==='next'? after_lambda: linkage;
	
	return append_instruction_sequence(
	              tack_on_instruction_sequence(
		                end_with_linkage(lambda_linkage
										  ,make_instruction_sequence(['env']
																						,[target]
																						,['(assign target (op make_compiled_proc) (label '+proc_entry+') (reg env))'])
		                ,(compile_lambda_body( exp, proc_entry))))
			      ,after_lambda);  
}

function compile_lambda_body(exp, proc_entry){
	var formals = lambda_parameters(exp);
	return append_instruction_sequence(make_instruction_sequence( ['env','proc','argl']
	                                                                                            ,['env']
																								,[proc_entry
																								  ,'(assign env (op get_compiled_proc_env) (reg proc))'
																								  ,'(assign env (op extend_env) (const '+formals+') (reg argl) (reg env))'])
	                                                ,compile_sequence(lambda_body(exp), 'val','return'));
	
}

function compile_application(exp,target,linkage){
	var proc_code = compile( app_operator(exp), 'proc','next');
	var oprands_code = app_oprands(exp).map(function(oprand){
		compile(oprand, 'val','next');
	});
	
	return preserving( ['env','continue']
	                  ,proc_code
					  ,preserving(['proc','continue']
					                      ,construct_arglist(oprands_code)
										  ,compile_proc_call(target,linkage)));
} 

function construct_arglist( oprands_code){		
	if(oprands_code==null ||  oprands_code.length ==0){
		make_instruction_sequence(['']
													 ,['argl']
													 ,['(assign argl (const ()))']);
	}else{
		var oprands_code = oprands_code.reverse();
		var code_to_get_last_arg  = append_instruction_sequence( oprands_code[0]
		                                                                                             ,make_instruction_sequence(['val']
																									                                               ,['argl']
																																				   ,['(assign argl (op list) (reg val))']));
		var rest_oprands  = oprands_code.slice(1);
		if(rest_oprands.length ==0){
			return code_to_get_last_arg;
		}else{
			return preserving( ['env']
			                             ,code_to_get_last_arg
										 ,code_to_get_rest_args(rest_oprands));
		}																																		   
	}
}

function code_to_get_rest_args(oprands_code){
	var code_for_next_arg = preserving(['argl']
	                                                       ,oprands_code[0]
														   ,make_instruction_sequence(['val','argl']
														                                                ,['argl']
																										,['(assign argl (op cons) (reg val) (reg argl))']));
	var rest_oprands = oprands_code.slice(1);
    if(rest_oprands.length ==0){
		return code_for_next_arg
	}else{
		return preserving(['env']
		                           ,code_for_next_arg
								   ,code_to_get_rest_args(rest_oprands));
	}	
}


function compile_proc_call(target,linkage){
	var prim_branch = make_label('prim_branch');
	var compiled_branch = make_label('compiled_branch');
	var after_call = make_label('after_call');
	//
	var compiled_linkage = linkage ==='next'? after_call: linkage;
	return append_instruction_sequence(make_instruction_sequence(['proc']
	                                                                                            ,['']
																								,['(test (op primitive)  (reg proc))'
																								  ,'(branch (label '+prim_branch+'))'])
	                                               ,parallel_instruction_sequence(append_instruction_sequence(compiled_branch
												                                                                                                    ,compile_proc_appl(target,compiled_linkage))
																									,append_instruction_sequence(prim_branch
																									,end_with_linkage(linkage,make_instruction_sequence(['proc','argl']
																									                                                                                     ,[target]
																																														 ,['(assign target (op apply_prim_procedure) (reg proc) (reg argl))']))))
													,after_call);
}


function compile_proc_appl(target,linkage){
	if( target==='val' && linkage !=='return'){
		return make_instruction_sequence( ['proc']
		                                                      ,['val','proc','argl','continue','exp']
															  ,['(assign continue (label '+linkage+'))'
															     ,'(assign val (op compiled_procedure_entry) (reg proc))'
																 ,'(goto (reg val))']);
	}else if(target !=='val' && linkage !== 'return'){
		var proc_return = make_label('proc_return');
		return make_instruction_sequence( ['proc']
		                                                        ,['val','proc','argl','continue','exp']
																,['(assign continue (label '+proc_return+'))'
																  ,'(assign val (op compiled_procedure_entry) (reg proc))'
																  ,'(goto (reg val))'
																  ,proc_return
																  ,'(assign '+target+' (reg val))'
																  ,'(goto (label '+linkage+'))']);
	}else if(target ==='val' && linkage ==='return'){
		return make_instruction_sequence(['proc','continue']
		                                                       ,['val','proc','argl','continue','exp']
															   ,['(assign val (op compiled_procedure_entry) (reg proc))'
															   ,'(goto (reg val))']);
	}else if(target !=='val' && linkage ==='return'){
		console.log('error linkage,target ');
	}else{
		console.log('cannot reach here ');
	}
}


// details of how instruction sequences are combined.
function registers_needed(s){
	return s.needed;
}

function registers_modified(s){
	return s.modified;
}

function registers_statements(s){
	return s.statement;
}

function needs_registers(sequence,reg){
	return -1 !== registers_needed(sequence).indexOf(reg);
}

function modifies_registers(sequence,reg){
	return -1 !== registers_modified(sequence).indexOf(reg);
}

function append_instruction_sequence(seq1,seq2){
	function append_2_seq(seq1,seq2){
		make_instruction_sequence(set_union(registers_needed(seq1), set_dif(registers_needed(seq2), registers_modified(seq1)))
			                                        ,set_union(registers_modified(seq1), registers_modified(seq2))
												    , registers_statements(seq1).append(registers_statements(seq2)));
													
	}
	append_2_seq(seq1,seq2);
}


//preserving procedure
// when registers need to be saved, 

function check(reg,seq1,seq2){
	if(needs_registers(seq2, reg) && modifies_registers(seq1,reg)){
		return true;
	}
	return false;
}

function preserving(reg_set,seq1,seq2){
	var saves =[];
	var restores = [];
	for(var i=0;i< reg_set.length;i++){
		var reg = reg_set[i];
		if(check(reg,seq1,seq2)){
		   var save_inst = '(save '+ reg +')';
		   var restore_inst = '(restore ' + reg + ')';
		   saves.push(save_inst);
		   restores.unshift(restore_inst);
		}
	}

	return append_instruction_sequence(
	              append_instruction_sequence(
	                  append_instruction_sequence(saves,seq1)
					  ,restores)
		          ,seq2);	  
}

// define the data structure of instruction sequenece
function make_instruction_sequence(reg_need,reg_modefiy,instructions){
	var s = {};
	s.reg_need     = reg_need;
	s.reg_modefiy = reg_modefiy;
	s.instructions  = instructions;
	return s;
}

// basic operation of make data structure. ->  append  <- 
function parallel_instruction_sequence(seq1,seq2){
	
}

// compile_linkage , how code do the next instruction
function empty_instruction_sequence(){
	var s ={
		   reg_need    : [],
	       reg_modefiy : [],
	       instructions  : []
	};
	return s;
}

function set_union(s1,s2){
	if(s1 == null || s1.length ==0){
		return s2;
	}else{
		var first = s1[0];
		if(s2.indexOf(first) ==-1){
			return set_union(s1.slice(1),s2).unshift(first);
		}else{
			return set_union(s1.slice(1),s2);
		}
		
	}
}

function set_dif(s1,s2){
	if(s1 ==null || s1.length ==0){
		return [];
	}else{
		var first = s1[0];
		if(s2.indexOf(first) ==-1){
			return set_union(s1.slice(1),s2).unshift(first);
		}else{
			return set_union(s1.slice(1),s2);
		}
		
	}
}


function tack_on_instruction_sequence(seq, body_seq){
	return make_instruction_sequence( registers_needed(seq)
	                                             , registers_modified(seq)
												 , registers_statements(seq).append(registers_statements(body_seq)));
}

function parallel_instruction_sequence(seq1,seq2){
	return make_instruction_sequence(set_union(registers_needed(seq1), registers_needed(seq2))
	                                                      ,set_union(registers_modified(seq1),registers_modified(seq2))
														  ,registers_statements(seq1).append(registers_statements(seq2)));
	                                                                      
}


function trace(info){
	console.log(info);
}

