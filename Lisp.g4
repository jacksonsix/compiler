grammar Lisp;
expr: define
       | ifexpr
	   | lambda
	   | begin
	   | self
	   | compound
	   ;
	   
define : '('  'define'   ID  INT ')' ;
ifexpr: '('  'if' expr   expr  'else'  expr ')';
lambda: '(' 'lambda' ')';
begin: '(' 'begin'  expr+ ')';
self: ID 
     | INT
	 ;
compound: '(' op  args ')';
op: expr;
args: expr;
	 
ID: [a-zA-Z]+;
INT : [0-9]+;
WS : [ \t\r\n]+ -> skip;
