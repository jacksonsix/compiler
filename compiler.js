//compile code to machine level
//compiler
// linkage  continue = next,  return = return to caller , jump = jump to label
// instruction sequence as a abstract object

function new_label_counter(){
		var count = 0;
		return function(){
			return count++;
		}
}
var global_label_counter = new_label_counter();

function trace(info,functionname){
	console.log(info);
	console.log(functionname);
}

// exp is actually middle layer object, gen from create_middle_object
function compile(exp ,target, linkage){
	var type = getType(exp);
	
	switch(type){
		case 'self':
			return compile_self(exp,target,linkage);
			break;
		case 'quote':	
			return compile_quoted(exp,target,linkage);
			break;	
		case 'variable':	
			return compile_variable(exp,target,linkage);
			break;	
		case 'assign':	
			return compile_assignment(exp,target,linkage);
			break;	
		case 'definition':	
			return compile_definition(exp,target,linkage);
			break;	
		case 'if':	
			return compile_if(exp,target,linkage);
			break;	
		case 'lambda':	
			return compile_lambda(exp,target,linkage);
			break;	
		case 'begin':	
			return compile_begin(exp,target,linkage);
			break;	
		case 'application':	
			return compile_application(exp,target,linkage);
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
		result = make_instruction_sequence([],[],['(goto (label '+linkage+'))']);
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
																			 ,['(assign ' + target + ' (const ' + exp.value + '))']));
}

function compile_quoted(exp ,target, linkage){
	var quoted_text = env_high_middle.quote_text(exp);
	return end_with_linkage(linkage
	                            ,make_instruction_sequence([]
								                                             ,[target]
																			 ,['(assign ' + target + ' (const  ' +quoted_text + '))']));
}

function compile_variable(exp ,target, linkage){
	//var variable = env_high_middle.define_var(exp);
	return end_with_linkage(linkage
	                            ,make_instruction_sequence(['env']
								                                             ,[target]
																			 ,['(assign '+target+' (op lookup_var_env) (const '+exp.value+') (reg env))']));
}

function compile_assignment(exp ,target, linkage){
	var variable = env_high_middle.assign_var(exp);
	var get_value_code = compile(env_high_middle.assign_value(exp),'val','next');
	
	return end_with_linkage(linkage
	                            ,preserving(['env']
								                  ,get_value_code
								                  ,make_instruction_sequence(['env','val']
								                                             ,[target]
																			 ,['(perform (op set_var_value) (const '+variable+') (reg val) (reg env))',
																			   '(assign '+target+' (const ok))'])));
}

function compile_definition(exp ,target, linkage){
	var variable = env_high_middle.define_var(exp).value;
	var valu = env_high_middle.define_value(exp);
	var get_value_code = compile(valu,'val','next');
	
	return end_with_linkage(linkage
	                            ,preserving(['env']
								                  ,get_value_code
								                  ,make_instruction_sequence(['env','val']
								                                             ,[target]
																			 ,['(perform (op define_variable) (const '+variable+') (reg val) (reg env))',
																			   '(assign '+target+' (const ok))'])));
}

function make_label(name){
	var result =  empty_instruction_sequence();
	result.instructions.push(name);
	return result;
}

function compile_if(exp,target,linkage){
	var label_counter = global_label_counter();
	var t_branch = make_label('true_branch_' +label_counter);
	var f_branch = make_label('false_branch_'+label_counter);
	var after_if = make_label('after_if_'+label_counter);
	
	var conseq_linkage =  linkage ==='next'? after_if.instructions[0] :linkage;
	var p_code = compile(env_high_middle.if_pred(exp),'val','next');
    var c_code = compile(env_high_middle.if_conseq(exp),target,conseq_linkage);
    var a_code = compile(env_high_middle.if_alt(exp),target,conseq_linkage);

	var tfcode = parallel_instruction_sequence(append_instruction_sequence( t_branch,c_code)
																	                                                      ,append_instruction_sequence(f_branch,a_code));
 	return preserving(['env','continue']
					,p_code
					,append_instruction_sequence(make_instruction_sequence(['val']
																												  ,[]
																												  ,[ '(test (op false?) (reg val))'
																													  ,'(branch (label '+f_branch.instructions[0]+'))'])
					                                                      ,tfcode
																		  ,after_if));
																		  
}

function compile_begin(exp,target,linkage){
	var seq = env_high_middle.begin_actions(exp);
	return compile_sequence(seq,target,linkage);
}

function compile_sequence(sequence,target,linkage){
	var code;
	if(env_high_middle.is_last_exp(sequence)){
		code = compile(env_high_middle.first_sequence(sequence),target,linkage);
	}else{
		code = preserving(['env','continue']
		                             ,compile(env_high_middle.first_sequence(sequence),target,'next')
									 ,compile_sequence(env_high_middle.rest_sequence(sequence), target,linkage));
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
	var label_counter = global_label_counter();
	var proc_entry = make_label('entry'+label_counter);
	var after_lambda = make_label('after_lambda'+label_counter);
	var lambda_linkage = linkage==='next'? after_lambda: linkage;
	var ww = make_instruction_sequence(['env']
																						,[target]
																						,['(assign target (op make_compiled_proc) (label '+proc_entry.instructions[0]+') (reg env))']);
	var bb = compile_lambda_body( exp, proc_entry);																					
	trace(label_counter,'compile_lambda'); trace(proc_entry,'compile_lambda'); trace(after_lambda,'compile_lambda');trace(lambda_linkage,'compile_lambda');
	trace(ww,'compile_lambda'); trace(bb,'compile_lambda');
	return append_instruction_sequence(
	               tack_on_instruction_sequence(end_with_linkage(lambda_linkage.instructions[0]
										                                                       ,ww)
		                                                           ,bb)
			      ,after_lambda);  
}

function compile_lambda_body(exp, proc_entry){
	var formals = env_high_middle.lambda_parameters(exp);
	var serie = '[';
	for(var i=0;i<formals.length;i++){
		serie += formals[i].value;
		serie += ',';
	} 
	
	serie =  serie.substring(0, serie.length - 1) + ']';
	var com_seq = compile_sequence(env_high_middle.lambda_body(exp), 'val','return');
	var ss = make_instruction_sequence( ['env','proc','argl']
	                                                                                            ,['env']
																								,[proc_entry.instructions[0]
																								  ,'(assign env (op get_compiled_proc_env) (reg proc))'
																								  ,'(assign env (op extend_env) (const '+serie+') (reg argl) (reg env))']);
	trace(formals,'compile_lambda_body'); trace(com_seq,'compile_lambda_body'); trace(ss,'compile_lambda_body');
	return append_instruction_sequence(ss
	                                                ,com_seq);
	
}

function compile_application(exp,target,linkage){
	var proc_code = compile( env_high_middle.app_operator(exp), 'proc','next');
	var oprands_code = env_high_middle.app_oprands(exp).map(function(oprand){
		return compile(oprand, 'val','next');
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
	var label_counter = global_label_counter();
	var prim_branch = make_label('prim_branch_' +label_counter);
	var compiled_branch = make_label('compiled_branch_'+label_counter);
	var after_call = make_label('after_call_'+label_counter);
	//
	var compiled_linkage = linkage ==='next'? after_call: linkage;
	return append_instruction_sequence(make_instruction_sequence(['proc']
	                                                                                            ,['']
																								,['(test (op primitive)  (reg proc))'
																								  ,'(branch (label '+prim_branch.instructions[0]+'))'])
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
	//trace(s);
	return s.reg_need;
}

function registers_modified(s){
	//trace(s);
	return s.reg_modefiy;
}

function registers_statements(s){
	return s.instructions;
}

function needs_registers(sequence,reg){
	return -1 !== registers_needed(sequence).indexOf(reg);
}

function modifies_registers(sequence,reg){
	return -1 !== registers_modified(sequence).indexOf(reg);
}

function append_instruction_sequence(...seq){
	function append_2_seq(seq1,seq2){
		trace(seq1,'append_2_para1');
		trace(seq2,'append_2_para2');		
		return make_instruction_sequence(set_union(registers_needed(seq1), set_dif(registers_needed(seq2), registers_modified(seq1)))
			                                                   ,set_union(registers_modified(seq1), registers_modified(seq2))
												               , registers_statements(seq1).concat(registers_statements(seq2)));
													
	}
	function append_seq_list(seqs){
	    if(seqs.length ==1){
			return seqs[0];
		}else{
			return append_2_seq(seqs[0], append_seq_list(seqs.slice(1)));
		}
	}
	trace(seq,'append');
	return append_seq_list(seq);
}


//preserving procedure
// when registers need to be saved, 

function check(reg,seq1,seq2){
	if(needs_registers(seq2, reg) && modifies_registers(seq1,reg)){
		return true;
	}
	return false;
}

function preserving_old(reg_set,seq1,seq2){
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
    if(saves.length > 0){
		return append_instruction_sequence(
			  append_instruction_sequence(
				  append_instruction_sequence(saves,seq1)
				  ,restores)
			  ,seq2);	
	}else{
		return append_instruction_sequence( seq1 ,seq2);
	}
  
}

function preserving(reg_set,seq1,seq2){
	if(reg_set ==null || reg_set.length==0){
		return append_instruction_sequence(seq1,seq2);
	}else{
		var first = reg_set[0];
		if( needs_registers(seq2,first) && modifies_registers(seq1,first)){
			return preserving(reg_set.slice(1)
			                  ,make_instruction_sequence(set_union([first],registers_needed(seq1))
							                                                 ,set_dif(registers_modified(seq1),[first])
																			 ,['(save '+first+')', registers_statements(seq1),'(restore '+first+')'])
							  ,seq2);
		}else{
			return preserving(reg_set.slice(1), seq1,seq2);
		}
	}
  
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
	if( s1.length ==0){
		return s2;
	}else if( s2.length ==0){
		return s1;
	}
	else{
		var first = s1[0];
		if(s2.indexOf(first) ==-1){
			return set_union(s1.slice(1),s2).concat(first);
		}else{
			return set_union(s1.slice(1),s2);
		}
		
	}
}

function set_dif(s1,s2){
	if(s1.length ==0){
		return [];
	}else if(s2.length ==0){
		return [];
	}
	else{
		var first = s1[0];
		if(s2.indexOf(first) ==-1){
			return set_union(s1.slice(1),s2).concat(first);
		}else{
			return set_union(s1.slice(1),s2);
		}
		
	}
}


function tack_on_instruction_sequence(seq, body_seq){
	trace(seq,'tack_on_instruction_sequence'); trace(body_seq,'tack_on_instruction_sequence');
	return make_instruction_sequence( registers_needed(seq)
	                                             , registers_modified(seq)
												 , registers_statements(seq).concat(registers_statements(body_seq)));
}

function parallel_instruction_sequence(seq1,seq2){
	return make_instruction_sequence(set_union(registers_needed(seq1), registers_needed(seq2))
	                                                      ,set_union(registers_modified(seq1),registers_modified(seq2))
														  ,registers_statements(seq1).concat(registers_statements(seq2)));
	                                                                      
}


