/**
 * Método para comprobar si está logueado o no y cargar lo necesario segun cada caso
 */
function volver() {
    $.ajax({
        url: DIR_SERV + '/logueado',
        type: "GET",
        dataType: "json"
    })
        .done(function (data) {

            if (data.usuario) {
                $("#respuesta").html("");
            }
            else if (data.error) {
                cargar_vista_error(data.error);
            }
            else {
                saltar_a("index.html")
            }

        })
        .fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
}

/**
 * Horario profesor admin
 */
function obtener_horario() {
    var dat_prof = $("#nombres").val().split("|");
    var cod = dat_prof[0];
    var nombre = dat_prof[1];
    $.ajax({
        url: encodeURI(DIR_SERV + "/horario/" + cod),
        type: "GET",
        dataType: "json"
    })
        .done(function (data) {
            if (data.no_auth) {
                saltar_a("index.html");
            } else if (data.horario) {
                var dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
                var horas = ["", "8:15- 9:15", "9:15 - 10:15", "10:15 - 11:15", "11:15 - 11:45", "11:45 - 12:45", "12:45 - 13:45", "13:45 - 14:45"];
                var output = "<h2>Horario del profesor: " + nombre + "</h2>";
                output += "<table class='centrar'><tr><th></th><th>" + dias[1] + "</th><th>" + dias[2] + "</th><th>" + dias[3] + "</th><th>" + dias[4] + "</th><th>" + dias[5] + "</th></tr>";
                for (let i = 1; i < 8; i++) {
                    output += "<tr><th>" + horas[i] + "</th>";
                    if (i == 4) {
                        output += "<td colspan=5>RECREO</td>";
                    } else {
                        for (let j = 1; j < 6; j++) {
                            output += "<td>";
                            let grupos_usuario = [];
                            let grupos_cod = [];
                            let grupos_aula;
                            let grupos_id_aula;
                            $.each(data.horario, function (key, value) {
                                if (value.dia == j && value.hora == i) {
                                    grupos_usuario.push(value.grupo);
                                    grupos_cod.push(value.id_grupo);
                                    grupos_aula = value.aula;
                                    grupos_id_aula = value.id_aula;
                                }
                            });
                            if (grupos_usuario.length > 0) {
                                output += grupos_usuario[0];
                            }
                            if (grupos_usuario.length > 1) {
                                for (let k = 1; k < grupos_usuario.length; k++) {
                                    output += "/" + grupos_usuario[k];
                                }
                            }
                            if (grupos_aula != undefined && grupos_aula != "Sin asignar o sin aula") {
                                output += "<br/>(" + grupos_aula + ")";
                            }
                            output += "<br/><button class='enlace' onclick='editar_grupos(\"" + i + "\", \"" + j + "\", \"" + cod + "\", \"" + grupos_aula + "\", \"" + grupos_id_aula + "\");event.preventDefault();'>Editar</button></td>";
                        }
                    }
                    output += "</tr>";
                }
                output += "</table>";
                $('#horarios').html(output);
                $("#editar").html("");
            } else {
                cargar_vista_error(data.error);
            }
        })
        .fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
}

/**
 * Horario profesor normal
 * @param {*} cod 
 * @param {*} nombre 
 */
function obtener_horario2(cod, nombre) {
    $.ajax({
        url: encodeURI(DIR_SERV + "/horario/" + cod),
        type: "GET",
        dataType: "json"
    })
        .done(function (data) {
            if (data.no_auth) {
                saltar_a("index.html");
            }
            else if (data.horario) {
                var dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
                var horas = ["", "8:15- 9:15", "9:15 - 10:15", "10:15 - 11:15", "11:15 - 11:45", "11:45 - 12:45", "12:45 - 13:45", "13:45 - 14:45"];
                var output = "<h2>Horario del profesor: " + nombre + "</h2>";
                output += "<table class='centrar'><tr><th></th><th>" + dias[1] + "</th><th>" + dias[2] + "</th><th>" + dias[3] + "</th><th>" + dias[4] + "</th><th>" + dias[5] + "</th></tr>";
                for (let i = 1; i < 8; i++) {
                    output += "<tr><th>" + horas[i] + "</th>";
                    if (i == 4) {
                        output += "<td colspan=5>RECREO</td>";
                    } else {
                        for (let j = 1; j < 6; j++) {
                            output += "<td>";
                            let grupos_usuario = [];
                            let grupos_aula;
                            $.each(data.horario, function (key, value) {
                                if (value.dia == j && value.hora == i) {
                                    grupos_usuario.push(value.grupo);
                                    grupos_aula = value.aula;
                                }
                            });
                            if (grupos_usuario.length > 0) {
                                output += grupos_usuario[0];
                            }
                            if (grupos_usuario.length > 1) {
                                for (let k = 1; k < grupos_usuario.length; k++) {
                                    output += "/" + grupos_usuario[k];
                                }
                            }
                            if (grupos_aula != undefined && grupos_aula != "Sin asignar o sin aula") {
                                output += "<br/>(" + grupos_aula + ")";
                            }
                            output += "</td>";
                        }
                    }
                    output += "</tr>";
                }
                output += "</table>";
                $('#horarios').html(output);
            } else {
                cargar_vista_error(data.error);
            }
        })
        .fail(function (a, b) {
            cargar_vista_error(error_ajax_jquery(a, b));
        });
}