/**
 * 
 * @param {*} dia 
 * @param {*} hora 
 * @param {*} id_usuarios_camb 
 * @param {*} cod_usuario 
 */
 function updateAula(dia, hora, id_usuarios_camb, cod_usuario){
    let usuarios_camb = id_usuarios_camb.split(",");
    let selectCambio = $("select#cambioAulasLibres").val().split("|");
    let selectGrupos = $("select#grupos_libres").val().split("|");
    let selectAulas = $("select#aulas").val().split("|");
    $.each(usuarios_camb, function (key, value) {
        $.ajax({
            //Primero modificamos el aula que ya teníamos
            url: encodeURI(DIR_SERV + "/updateAula/" + dia + "/" + hora + "/" + value + "/" + selectCambio[0]),
            type: "PUT",
            dataType: "json"
        }).done(function (data) {
            $.ajax({
                //Luego insertamos el grupo que queríamos con el aula indicada
                url: encodeURI(DIR_SERV + "/insertarGrupo/" + dia + "/" + hora + "/" + cod_usuario + "/" + selectGrupos[0] + "/" + selectAulas[0]),
                type: "GET",
                dataType: "json"
            }).done(function (data) {
                obtener_horario();
                editar_grupos(hora, dia, cod_usuario, selectAulas[0], selectAulas[1]);
            }).fail(function (a, b) {
                cargar_vista_error(error_ajax_jquery(a, b));
            });
        }).fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
    });

    cerrar_modal();
}

/**
 * 
 * @param {*} dia 
 * @param {*} hora 
 * @param {*} grupo 
 * @param {*} cod_usuario 
 * @param {*} aula 
 * @param {*} id_aula 
 */
 function borrar_grupo(dia, hora, grupo, cod_usuario, aula, id_aula) {
    $.ajax({
        url: encodeURI(DIR_SERV + "/borrarGrupo/" + dia + "/" + hora + "/" + cod_usuario + "/" + grupo),
        type: "DELETE",
        dataType: "json"
    }).done(function (data) {
        $.ajax({
            url: encodeURI(DIR_SERV + "/tieneGrupo/" + dia + "/" + hora + "/" + cod_usuario),
            type: "GET",
            dataType: "json"
        }).done(function (data) {
            obtener_horario();
            if (data.tiene_grupo) {
                editar_grupos(hora, dia, cod_usuario, aula, id_aula);
            } else {
                editar_grupos(hora, dia, cod_usuario, "undefined", id_aula);
            }

        }).fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
}