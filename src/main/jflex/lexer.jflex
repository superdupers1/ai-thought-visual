import java.util.ArrayList;
%%
%public
%class Lexer
%standalone
%{
    private List<String> tokens = new ArrayList<>();
%}


%{

    prvate List<String> analizar(String archivo){
        FileReader in = null;
        try{
            in = new FileReader(archivo);
            Lexer lexer = new Lexer(in);
        while(!lexer.zzAtEOF){
            lexer.yylex();
        }
    }catch(Exception ex){
        System.out.println("Error al analisar el archivo.");
    }finally{
        try{
        in.close();
        }catch(Exception ex){
            System.out.println("Error al cerrar el archivo.");
        }
        
        }
        return tokens;
}


%}

%%

"("     {tokens.add("(");System.out.println("PARENTESIS IZQUIERDO");}
")"     {tokens.add(")");System.out.println("PARENTESIS DERECHO");}
","     {tokens.add(",");System.out.println("COMA");}
";"     {tokens.add(";");System.out.println("PUNTO Y COMA");}
"."     {tokens.add(".");System.out.println("PUNTO");}
[A-Z a-z]+  {tokens.add("var"); System.out.println("VARIABLE");}
[0-9]+  {tokens.add("entero"); System.out.println("ENTERO");}
:-  {tokens.add(":-"); System.out.println("IMPLICA");}