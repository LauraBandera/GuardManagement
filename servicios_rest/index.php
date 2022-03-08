<?php
session_name("pract2_login_21_22");
session_start();

require "funciones_servicios.php";
require __DIR__ . '/Slim/autoload.php';
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: X-Requested-With');

$app= new \Slim\App;

$app->get('/logueado',function(){
    echo json_encode( seguridad(), JSON_FORCE_OBJECT);
});


$app->get('/salir',function(){
    session_destroy();
    echo json_encode( array("nada"=>"nada"), JSON_FORCE_OBJECT);
});

$app->post('/login',function($request){
    $datos[]=$request->getParam('usuario');
    $datos[]=$request->getParam('clave');
    
    echo json_encode( login_usuario($datos), JSON_FORCE_OBJECT);
});


/* ********************************************************************
 * ********************************************************************
 * ********************* SERVICIOS PARA LA APP ************************
 * ********************************************************************
 * ********************************************************************
 */

$app->get('/horario/{id_usuario}',function($request){
    $datos[] = $request->getAttribute("id_usuario");
  
    echo json_encode(horario($datos), JSON_FORCE_OBJECT);
  });
  
  $app->get('/usuarios',function($request){
  
    echo json_encode(usuarios(), JSON_FORCE_OBJECT);
  });
  
  $app->get('/tieneGrupo/{dia}/{hora}/{id_usuario}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
  
    echo json_encode(tieneGrupo($datos), JSON_FORCE_OBJECT);
  });
  
  $app->get('/grupos/{dia}/{hora}/{id_usuario}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
  
    echo json_encode(grupos($datos), JSON_FORCE_OBJECT);
  });
  
  $app->get('/gruposLibres/{dia}/{hora}/{id_usuario}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
  
    echo json_encode(gruposLibres($datos), JSON_FORCE_OBJECT);
  });
  
  $app->delete('/borrarGrupo/{dia}/{hora}/{id_usuario}/{id_grupo}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
    $datos[] = $request->getAttribute("id_grupo");

    echo json_encode(borrarGrupo($datos), JSON_FORCE_OBJECT);
  });
  
  //Hemos tenido que cambiar este método a get porque mac no lo coge
  $app->get('/insertarGrupo/{dia}/{hora}/{id_usuario}/{id_grupo}/{aula}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
    $datos[] = $request->getAttribute("id_grupo");
    $datos[] = $request->getAttribute("aula");
  
    echo json_encode(insertarGrupo($datos), JSON_FORCE_OBJECT);
  });

  $app->get('/aulasLibres/{dia}/{hora}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
  
    echo json_encode(aulasLibres($datos), JSON_FORCE_OBJECT);
  });

  $app->get('/aulasOcupadas/{dia}/{hora}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
  
    echo json_encode(aulasOcupadas($datos), JSON_FORCE_OBJECT);
  });

  $app->get('/comprobacionAdd/{dia}/{hora}/{aula}/{usuario}',function($request){
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("aula");
    $datos[] = $request->getAttribute("usuario");
  
    echo json_encode(comprobacionAdd($datos), JSON_FORCE_OBJECT);
  });

  $app->put('/updateAula/{dia}/{hora}/{id_usuario}/{aula}',function($request){
    $datos[] = $request->getAttribute("aula");
    $datos[] = $request->getAttribute("dia");
    $datos[] = $request->getAttribute("hora");
    $datos[] = $request->getAttribute("id_usuario");
  
    echo json_encode(updateAula($datos), JSON_FORCE_OBJECT);
  });


// Una vez creado servicios los pongo a disposición
$app->run();
?>
