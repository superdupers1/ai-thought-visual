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

":"     {tokens.add(":");System.out.println("DOS PUNTOS");}
";"     {tokens.add(";");System.out.println("PUNTO Y COMA");}
[A-Z a-z]+  {tokens.add("id"); System.out.println("IDENTIFICADOR");}
[0-9]+  {tokens.add("num"); System.out.println("NUMEROS");}
"<"     {tokens.add("<");System.out.println("MENOR QUE");}
">"     {tokens.add(">");System.out.println("MAYOR QUE");}
"%%"     {tokens.add("%%");System.out.println("DOBRE PORCENTAJE");}
"=="     {tokens.add("==");System.out.println("IGUAL QUE");}