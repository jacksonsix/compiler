package machine;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.LinkedList;
import java.util.List;

public interface IExpression {
	public static Object NullExpression(){
		return null;
	}
	
	public static Object deepcopy(Object obj) throws InstantiationException, IllegalAccessException{		
	        try{
	        	int a = 4;
	        	Class<?> clazz = ((Object)a).getClass();
	        	Boolean b =((Object)a).getClass().isPrimitive();
	        	Boolean bb = int.class.isPrimitive();
	            Object clone = obj.getClass().newInstance();
	            for (Field field : obj.getClass().getDeclaredFields()) {
	                field.setAccessible(true);
	                if(field.get(obj) == null || Modifier.isFinal(field.getModifiers())){
	                    continue;
	                }
	                if(field.getType().equals(Integer.class)
	                		|| field.getType().equals(String.class)
	                		|| field.getType().equals(Float.class)
	                		|| field.getType().equals(Double.class)
	                        || field.getType().equals(Boolean.class)){
	                    field.set(clone, field.get(obj));
	                }else if(field.getType().equals(List.class)){
	                	//field = new LinkedList<IExpression>();
	                	List<Object> flist = new LinkedList<Object>();
	                	int len = ((java.util.LinkedList)field.get(obj)).size();
	                	for(Object o : ((java.util.LinkedList)field.get(obj))){
	                		flist.add(deepcopy(o));
	                	}	                	
	                	field.set(clone,flist );
	                }
	                else{
	                    Object childObj = field.get(obj);
	                    if(childObj == obj){
	                        field.set(clone, clone);
	                    }else{
	                        field.set(clone, deepcopy(field.get(obj)));
	                    }
	                }
	            }
	            return clone;
	        }catch(Exception e){
	            return null;
	        }
	}

}
