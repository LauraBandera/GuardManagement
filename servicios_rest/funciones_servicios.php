<?php
require "config_bd.php";
define ('MINUTOS',10);

function seguridad(){
    if(isset($_SESSION["usuario"]) && isset($_SESSION["clave"]) && isset($_SESSION["ultimo_acceso"])){
        if(time()-$_SESSION["ultimo_acceso"]>MINUTOS*60){
            $respuesta["time"]="Tiempo de sesión caducado";
        }else{
            try{
                $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
                $consulta="select * from usuarios where usuario=? and clave=?";
                $sentencia=$conexion->prepare($consulta);
                if($sentencia->execute([$_SESSION["usuario"],$_SESSION["clave"]])){
                    if($sentencia->rowCount()>0){
                        $respuesta["usuario"]=$sentencia->fetch(PDO::FETCH_ASSOC);
                        $_SESSION["ultimo_acceso"]=time();
                    }else{
                        $respuesta["baneo"]="El usuario no se encuentra registrado en la BD";
                    }
                }else{
                    $respuesta["error"]= "Error en la consulta. Error n&uacute;mero:".$sentencia->errorInfo()[1]." : ".$sentencia->errorInfo()[2];
                }

                $sentencia=null;
                $conexion=null;
            }catch(PDOException $e){
                $respuesta["error"]="Imposible conectar:".$e->getMessage();
            }
        }
    }else{
        $respuesta["no_login"]="No está logueado";
    }
    return $respuesta;
}

function login_usuario($datos){
    try{
        $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
        $consulta="select * from usuarios where usuario=? and clave=?";
        $sentencia=$conexion->prepare($consulta);
        if($sentencia->execute($datos)){
            if($sentencia->rowCount()>0){
                $respuesta["usuario"]=$sentencia->fetch(PDO::FETCH_ASSOC);
                $_SESSION["usuario"]=$datos[0];
                $_SESSION["clave"]=$datos[1];
                $_SESSION["ultimo_acceso"]=time();
            }else{
                $respuesta["mensaje"]="El usuario no se encuentra registrado en la BD";
            }
        }else{
            $respuesta["error"]= "Error en la consulta. Error n&uacute;mero:".$sentencia->errorInfo()[1]." : ".$sentencia->errorInfo()[2];
        }
        $sentencia=null;
        $conexion=null;
    }catch(PDOException $e){
        $respuesta["error"]="Imposible conectar:".$e->getMessage();
    }
    return $respuesta;
}

/**
 * ***************************************************************************
 * ************************ FUNCIONES PARA LOS HORARIOS **********************
 * ***************************************************************************
 */

function horario($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select dia, hora, grupos.id_grupo as id_grupo, grupos.nombre as grupo, aulas.nombre as aula, aulas.id_aula as id_aula
                      from grupos, horario_lectivo, aulas 
                      where grupos.id_grupo=horario_lectivo.grupo and horario_lectivo.aula=aulas.id_aula and usuario=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["horario"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }
  
  function usuarios(){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select * from usuarios where tipo='normal'";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute()){
        $respuesta["usuarios"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }
  
  function tieneGrupo($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select * from horario_lectivo where dia=? and hora=? and usuario=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        if($sentencia->rowCount() > 0){
          $respuesta["tiene_grupo"] = true;
        }else{
          $respuesta["tiene_grupo"] = false;
        }
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }
  
  function grupos($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select grupos.id_grupo as id_grupo, grupos.nombre as nombre from grupos, horario_lectivo where grupos.id_grupo=horario_lectivo.grupo and dia=? and hora=? and usuario=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["grupos"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }
  
  function gruposLibres($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select id_grupo, nombre 
                from grupos 
                where (id_grupo, nombre) not in (
                        select grupos.id_grupo, grupos.nombre 
                        from grupos, horario_lectivo 
                        where grupos.id_grupo=horario_lectivo.grupo and dia=? and hora=? and usuario=?)";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["grupos"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion ";
    }
    return $respuesta;
  }
  
  function borrarGrupo($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "delete from horario_lectivo where dia=? and hora=? and usuario=? and grupo=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["mensaje"] = "Grupo borrado con éxito";
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }
  
  function insertarGrupo($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "insert into horario_lectivo (dia, hora, usuario, grupo, aula) value (?,?,?,?,?)";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["mensaje"] = "Grupo insertado con éxito";
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }

  /*
   * *******************************************************************
   * ****** Servicios necesarios para el select del añadir *************
   * *******************************************************************
   */

  function aulasLibres($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      
      $consulta = "select * from aulas where (id_aula, nombre) not in (
              select aulas.id_aula, aulas.nombre 
              from aulas,horario_lectivo 
              where aulas.id_aula=horario_lectivo.aula and aulas.id_aula<>64 and dia=? and hora=?)";
      $sentencia = $conexion->prepare($consulta);
      
      if($sentencia->execute($datos)){
        $respuesta["aulas_libres"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion ";
    }
    return $respuesta;
  }

  function aulasOcupadas($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      
      $consulta = "select distinct aulas.id_aula, aulas.nombre from aulas,horario_lectivo where aulas.id_aula=horario_lectivo.aula and dia=? and hora=?";
      $sentencia = $conexion->prepare($consulta);
      
      if($sentencia->execute($datos)){
        $respuesta["aulas_ocupadas"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion ";
    }
    return $respuesta;
  }


  /**
   * ****************** Servicio necesario para comprobaciones en la función añadir
   */
  //Devuelve el profesor y el grupo que tiene en el aula a esa hora y ese día
  function comprobacionAdd($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "select usuario, grupo, grupos.nombre as grupo_nombre from grupos, horario_lectivo where grupos.id_grupo=horario_lectivo.grupo and dia=? and hora=? and aula=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        if($sentencia->rowCount() > 0){
          $respuesta["comprobacion"] = true;
          $respuesta["valores"] = $sentencia->fetchAll(PDO::FETCH_ASSOC);
        }else{
          $respuesta["comprobacion"] = false;
        }
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }

  function updateAula($datos){
    try{
      $conexion= new PDO("mysql:host=".SERVIDOR_BD.";dbname=".NOMBRE_BD,USUARIO_BD,CLAVE_BD,array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES 'utf8'"));
      $consulta = "update horario_lectivo set aula=? where dia=? and hora=? and usuario=?";
      $sentencia = $conexion->prepare($consulta);
      if($sentencia->execute($datos)){
        $respuesta["mensaje"] = "Cambio realizado con éxito";
      }else{
        $respuesta["error"] = "Error en la consulta";
      }
      
      $conexion = null;
      $sentencia = null;
    }catch(PDOException $e){
      $respuesta["error"] = "Error en la conexion";
    }
    return $respuesta;
  }