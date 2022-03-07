/**
 * select profesor admin
 */
 function form_admin() {
    $.ajax({
        url: encodeURI(DIR_SERV + "/usuarios"),
        type: "GET",
        dataType: "json"
    })
        .done(function (data) {
            if (data.no_auth) {
                saltar_a("index.html");
            } else if (data.usuarios) {
                var output = "<form onsubmit='obtener_horario();event.preventDefault();'>";
                output += "<p>Seleccione el profesor <select name='nombres' id='nombres'>";
                $.each(data.usuarios, function (key, value) {
                    output += "<option value='" + value["id_usuario"] + "|" + value["nombre"] + "'>" + value["nombre"] + "</option>";

                });
                output += "</select> <button>Ver Horario</button></p>";

                output += "</form>";
                $('#formulario_admin').html(output);
            }
        })
        .fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
}

/**
 * Formulario debajo de la tabla con los dos select de grupos y aula
 * @param {*} hora 
 * @param {*} dia 
 * @param {*} cod_usuario 
 * @param {*} aula 
 * @param {*} id_aula 
 */
function editar_grupos(hora, dia, cod_usuario, aula, id_aula) {
    $.ajax({
        url: encodeURI(DIR_SERV + "/grupos/" + dia + "/" + hora + "/" + cod_usuario),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        var dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
        var horas = ["", "8:15- 9:15", "9:15 - 10:15", "10:15 - 11:15", "11:15 - 11:45", "11:45 - 12:45", "12:45 - 13:45", "13:45 - 14:45"];

        var output = "<h2>Editando la " + hora + "º hora (" + horas[hora] + ") del " + dias[dia] + "</h2>";
        output += "<table><tr><th>Grupo (Aula)</th><th>Acción</th></tr>";
        $.each(data.grupos, function (key, value) {
            output += "<tr><td>" + value.nombre + " (" + aula + ")</td><td><button class='enlace' onclick='borrar_grupo(\"" + dia + "\", \"" + hora + "\", \"" + value.id_grupo + "\", \"" + cod_usuario + "\", \"" + aula + "\", \"" + id_aula + "\");event.preventDefault();'>Quitar</button></td></tr>";
        });
        output += "</table><br/><br/>";

        output += "<form onsubmit='add_grupo(\"" + dia + "\", \"" + hora + "\", \"" + cod_usuario + "\");event.preventDefault();'>";
        if (aula != "Sin asignar o sin aula") {
            output += "<label>Grupo:</label>";
            output += "<select name='grupos_libres' id='grupos_libres' onchange='comprobar_grupo(\"" + dia + "\", \"" + hora + "\", \"" + cod_usuario + "\", \"" + aula + "\", \"" + id_aula + "\");event.preventDefault();'>";
            grupos_libres(dia, hora, cod_usuario, aula);
            output += "</select>";

            output += "<label>Aula:</label><select name='aulas' id='aulas'>";
            if (aula == "undefined") {
                output += "<option value='64|Sin asignar o sin aula'>Sin asignar o sin aula</option>";
            } else {
                output += "<option value='" + id_aula + "|" + aula + "'>" + aula + "</option>";
            }

            output += "</select>";
            output += "<button>Añadir</button>";
        } else {
            output += "<label>Grupo:</label><select disabled></select>";
            output += "<label>Aula:</label><select disabled></select>";
            output += "<button disabled>Añadir</button>";
        }
        output += "</form><br/><div id='info_add'></div>";

        $("#editar").html(output);
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
}

/**
 * Método para el onchange del select de grupos
 * @param {*} dia 
 * @param {*} hora 
 */
function comprobar_grupo(dia, hora, cod_usuario, aula, id_aula) {
    let grupo_select = $("#grupos_libres").val().split("|");
    
    $.ajax({
        url: encodeURI(DIR_SERV + "/tieneGrupo/" + dia + "/" + hora + "/" + cod_usuario),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        if(!data.tiene_grupo){
            if (grupo_select[1].match(/^[a-zA-Z]/)) {
                $.ajax({
                    url: encodeURI(DIR_SERV + "/aulasLibres/" + dia + "/" + hora),
                    type: "GET",
                    dataType: "json"
                }).done(function (data) {
                    let output = "<optgroup label='Libres'>";
                    $.each(data.aulas_libres, function (key, value) {
                        if (value.nombre == "Sin asignar o sin aula") {
                            output += "<option selected value='" + value.id_aula + "|" + value.nombre + "'>" + value.nombre + "</option>";
                        }
                    });
                    $("select#aulas").html("");
                    $("select#aulas").html(output);
                }).fail(function (a, b) {
                    cargar_vista_error(error_ajax_jquery(a, b));
                });
            }else{
                aulas(dia, hora);
            }
        }else{
            let output = "<option value='" + id_aula + "|" + aula + "'>" + aula + "</option>";
            $("select#aulas").html("");
            $("select#aulas").html(output);
        }
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
    
}

/**
 * Primera fase del modal
 * @param {*} dia 
 * @param {*} hora 
 * @param {*} cod_usuario 
 */
function add_grupo(dia, hora, cod_usuario) {
    let grupo_select = $("#grupos_libres").val().split("|");
    let aula_select = $("#aulas").val().split("|");
    var dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

     $.ajax({
        url: encodeURI(DIR_SERV + "/comprobacionAdd/" + dia + "/" + hora + "/" + aula_select[0]),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        if (grupo_select[1].match(/^[^a-zA-Z]/) && aula_select[0] == 64) {
            $("#info_add").html("Error: No le ha asignado un grupo a un aula");
        } else {
            if(data.comprobacion && data.valores[0].grupo != grupo_select[0] && grupo_select[1].match(/^[^a-zA-Z]/)){
                var html_code="<h2 class='centrar'>Confirmación Cambio de Aula del "+dias[dia]+" a "+hora+"º Hora</h2>";
                html_code+="<p class='centrar'>Has seleccionado un aula que está usada por el profesor ";
                let list_usuarios = [];
                $.each(data.valores, function (key, value) {
                    html_code += value.usuario+", ";
                    list_usuarios.push(value.usuario);
                });
                
                html_code += "en el grupo "+data.valores[0].grupo_nombre+"</p>";
                html_code+="<p class='centrar'>Para añadir este aula a "+grupo_select[1]+", debes cambiarle antes el aula a "+data.valores[0].grupo_nombre+"</p>";
                html_code+="<p class='centrar'><button onclick='cerrar_modal();'>Cancelar</button>";
                html_code += "<button onclick='nuevaAula(\"" + dia + "\", \"" + hora + "\",\"" + list_usuarios + "\",\"" + cod_usuario + "\",\"" + data.valores[0].grupo_nombre + "\");event.preventDefault();'>Cambiar</button></p>";
                    
                abrir_modal(html_code);
            }else{
                $("#info_add").html("");
                $.ajax({
                    url: encodeURI(DIR_SERV + "/insertarGrupo/" + dia + "/" + hora + "/" + cod_usuario + "/" + grupo_select[0] + "/" + aula_select[0]),
                    type: "GET",
                    dataType: "json"
                }).done(function (data) {
                    obtener_horario();
                    editar_grupos(hora, dia, cod_usuario, aula_select[1], aula_select[0]);
                }).fail(function (a, b) {
                    cargar_vista_error(error_ajax_jquery(a, b));
                });
            }
        }
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
}

/**
 * Nueva aula para el update del modal
 * @param {*} dia 
 * @param {*} hora 
 * @param {*} id_usuarios_camb 
 * @param {*} cod_usuario 
 * @param {*} grupo 
 */
function nuevaAula(dia,hora,id_usuarios_camb, cod_usuario, grupo){
    var dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    cerrar_modal();
    
    let html_code="<h2 class='centrar'> Cambio de Aula a " + grupo + " el " + dias[dia] + " a " + hora + "º Hora</h2>";
    html_code+="<p class='centrar'>Elija un nuevo aula libre: <select id='cambioAulasLibres' name='cambioAulasLibres'>";
    $.ajax({
        url: encodeURI(DIR_SERV + "/aulasLibres/" + dia+"/"+hora),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        $.each(data.aulas_libres, function (key, value) {
            if(value.nombre != "Sin asignar o sin aula") html_code += "<option value='" + value.id_aula + "|" + value.nombre + "'>" + value.nombre + "</option>";
        });
        $("select#cambioAulasLibres").html(html_code);
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
    html_code += "</select> </p>";
    html_code+="<p class='centrar'><button onclick='cerrar_modal();'>Cancelar</button> <button onclick='updateAula(\"" + dia + "\",\"" + hora + "\",\"" + id_usuarios_camb + "\",\"" + cod_usuario + "\");event.preventDefault();'>Cambiar</button></p>";
    
    abrir_modal(html_code);
}

/**
 * 
 * @param {*} dia 
 * @param {*} hora 
 * @param {*} cod_usuario 
 */
function grupos_libres(dia, hora, cod_usuario, aula) {
    $.ajax({
        url: encodeURI(DIR_SERV + "/gruposLibres/" + dia + "/" + hora + "/" + cod_usuario),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        let output = "<optgroup label='Con Aula'>";
        $.each(data.grupos, function (key, value) {
            if (value.nombre.match(/^[^a-zA-Z]/)) output += "<option value='" + value.id_grupo + "|" + value.nombre + "'>" + value.nombre + "</option>";
        });

        if(aula == "undefined"){
            output += "<optgroup label='Sin Aula'>";
            $.each(data.grupos, function (key, value) {
                if (value.nombre == "GUARD") {
                    if (value.nombre.match(/^[a-zA-Z]/)) output += "<option selected value='" + value.id_grupo + "|" + value.nombre + "'>" + value.nombre + "</option>";
                } else {
                    if (value.nombre.match(/^[a-zA-Z]/)) output += "<option value='" + value.id_grupo + "|" + value.nombre + "'>" + value.nombre + "</option>";
                }
            });
        }
        
        $("select#grupos_libres").html(output);
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
}

/**
 * Select con todas las aulas separadas por libres u ocupadas
 * @param {*} dia 
 * @param {*} hora 
 */
function aulas(dia, hora) {
    $.ajax({
        url: encodeURI(DIR_SERV + "/aulasLibres/" + dia + "/" + hora),
        type: "GET",
        dataType: "json"
    }).done(function (data) {
        $("select#aulas").html("");
        let output = "<optgroup label='Libres'>";
        $.each(data.aulas_libres, function (key, value) {
            output += "<option value='" + value.id_aula + "|" + value.nombre + "'>" + value.nombre + "</option>";
        });
        $.ajax({
            url: encodeURI(DIR_SERV + "/aulasOcupadas/" + dia + "/" + hora),
            type: "GET",
            dataType: "json"
        }).done(function (data) {
            output += $("select#aulas").html();
            output += "<optgroup label='Ocupadas'>";

            $.each(data.aulas_ocupadas, function (key, value) {
                output += "<option value='" + value.id_aula + "|" + value.nombre + "'>" + value.nombre + "</option>";
            });
            $("select#aulas").html(output);
        }).fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
    }).fail(function (a, b) {
        cargar_vista_error(error_ajax_jquery(a, b));
    });
}
