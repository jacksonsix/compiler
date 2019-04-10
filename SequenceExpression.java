package machine;

import java.util.LinkedList;
import java.util.List;

public class SequenceExpression implements IExpression {
    List<IExpression> exps;
    public SequenceExpression(){
    	exps = new LinkedList<IExpression>();
    }
    public SequenceExpression(List<IExpression> exps){    	
    	this.exps = exps;
    }
	public List<IExpression> getSequence(){
		return exps;
	}
}
