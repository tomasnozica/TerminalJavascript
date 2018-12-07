require('@pmoo/oow');
const {
  suite,
  test,
  before,
  assertTrue,
  assertFalse,
  assertEquals,
} = require('@pmoo/testy');

const { Consola, Archivo, Directorio, Usuario } = require('./terminal');

suite('terminal', () => {
  before(() => {
    var usuario = new Usuario('tomas-n','clave');
    var nullUser = new Usuario('nulluser','nullpass');
    var rootUser = new Usuario('root-user','allaccess');
    var raiz = new Directorio('raiz',rootUser,rootUser);
    var consola = new Consola(raiz);
    var rootWrongPassword = new Usuario('root','1234')
    var carpeta = new Directorio('Escritorio', raiz, rootUser );
    var archivo = new Archivo('Mis Datos','Mi nombre es Tomas y tengo 20 años');
    consola.newUser(rootUser);

    return {
      consola: consola,
      usuario: usuario,
      rootUser: rootUser,
      rootWrongPassword: rootWrongPassword,
      carpeta: carpeta,
      archivo: archivo,
      raiz: raiz,
      nullUser: nullUser,
    }
  });
  
  test('01 - Inicialmente no hay ningun usuario logueado', (c) => {
    return assertEquals(c.consola.usuarioLogueado,c.nullUser)
  });
  test('02 - Nos podemos loguear como root',(c) => {
    c.consola.login(c.rootUser);
    return assertTrue(c.consola.usuarioLogueado == c.rootUser)
  });
  test('03 - Si la contraseña de root esta mal no se puede loguear' ,(c) => {
    c.consola.login(c.rootWrongPassword);
    return assertEquals(c.consola.usuarioLogueado,c.nullUser);
  });
  test('04 - Si el logueo es exitoso, la carpeta actual es raiz', (c) => {
    c.consola.login(c.rootUser);
    return assertEquals(c.consola.directorioActual,c.raiz);
  });
  test('05 - El contenido de la carpeta raiz esta vacio', (c) => {
    c.consola.login(c.rootUser);
    return assertTrue(c.consola.directorioActual.hijos.length == 0)
  });
  test('06 - Crear una carpeta dentro de root', (c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    return assertTrue(c.consola.directorioActual.hijos[0] == c.carpeta)
  });
  test('07 - Ir a una carpeta en root', (c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.irA(c.carpeta);
    return assertTrue(c.consola.directorioActual == c.carpeta)
  });
  test('08 - Crear un archivo en la nueva carpeta', (c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.irA(c.carpeta);
    c.consola.addElement(c.archivo);
    return assertTrue(c.consola.directorioActual.hijos[0] == c.archivo)
  });
  test('09 - Ver el contenido del archivo creado', (c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.irA(c.carpeta);;
    c.consola.addElement(c.archivo);
    return assertEquals(c.consola.directorioActual.hijos[0].contenido, 'Mi nombre es Tomas y tengo 20 años')
  });
  test('10 - Borrar un archivo',(c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.irA(c.carpeta);;
    c.consola.addElement(c.archivo);
    c.consola.eliminar(c.archivo.nombre);
    return assertTrue(c.consola.directorioActual.hijos.length == 0)
  });
  test('11 - Borrar una carpeta',(c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.eliminar(c.carpeta.nombre);
    return assertTrue(c.consola.directorioActual.hijos.length == 0)
  });
  test('12 - Ir a la carpeta anterior sin indicar el nombre',(c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.carpeta);
    c.consola.irA(c.carpeta);
    c.consola.irA(c.consola.directorioActual.back());
    return assertTrue(c.consola.directorioActual.nombre == 'raiz')
  });
  test('13 - Crear un usuario logueado como root',(c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    return assertTrue(c.consola.usuarios.length == 2)
  });
  test('14 - Nos podemos loguear con un usuario no root',(c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    return assertTrue(c.consola.usuarioLogueado == c.usuario)
  });
  test('15 - No nos podemos loguear con un usuario no existente',(c) => {
    c.consola.login(c.usuario);
    return assertEquals(c.consola.usuarioLogueado,c.nullUser)
  });
  test('16 - Cuando se crea archivo o carpeta el usuario actual es dueño',(c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Fotos');
    c.consola.irA(carpeta);
    return assertEquals(c.consola.directorioActual.owner,c.usuario)
  });
  test('17 - Se puede eliminiar un usuario', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.deleteUser(c.usuario);
    return assertFalse(c.consola.usuarios.includes(c.usuario));
  });
  test('18 - Cambio la clave y puedo entrar con la nueva', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    c.consola.changeUserPassword('clave','12456');
    c.consola.logout();
    c.consola.login(c.usuario);
    return assertEquals(c.consola.usuarioLogueado,c.usuario)
  });
  test('19 - Cambio la clave y no puedo entrar con la vieja', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    c.consola.changeUserPassword('clave','12456');
    c.consola.logout();
    var wrongAccess = new Usuario('tomas-n','clave');
    c.consola.login(wrongAccess);
    return assertEquals(c.consola.usuarioLogueado,c.nullUser)
  });
  test('20 - Puedo editar un archivo existente', (c) => {
    c.consola.login(c.rootUser);
    c.consola.addElement(c.archivo);
    c.consola.editarArchivo(c.archivo,'Juan compra peras en la fruteria');
    return assertEquals(c.archivo.contenido, 'Juan compra peras en la fruteria');
  });
  test('21 - Si un usuario no respeta el formato no se crea', (c) => {
    c.consola.login(c.rootUser);
    return assertFalse(c.consola.newUser(new Usuario('name','123987')));
  });
  test('22 - El owner tiene permiso de escritura en una carpeta que creo', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Fotos');
    return assertTrue(carpeta.permisos[0][0]== c.usuario);
  });
  test('23 - Alguien no autorizado no puede ejecutar el comando mkdir', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    var carpeta = c.consola.mkdir('Fotos');
    c.consola.logout();
    c.consola.login(c.usuario);
    c.consola.irA(carpeta);
    var intento = c.consola.mkdir('MiCarpeta');
    return assertTrue(c.consola.directorioActual.hijos[0] ==  undefined);
  });
  test('24 - El owner de una carpeta puede escribir un archivo', (c) =>{
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Textos');
    c.consola.irA(carpeta);
    c.consola.escribirArchivo('Mi Texto','Este es mi texto de prueba');
    return assertEquals(c.consola.directorioActual.hijos[0].contenido, 'Este es mi texto de prueba');
  });
  test('25 - Alguien no autorizado no puede escribir archivo', (c) =>{
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    var carpeta = c.consola.mkdir('Textos');
    c.consola.logout();
    c.consola.login(c.usuario);
    c.consola.irA(carpeta);
    c.consola.escribirArchivo('Mi Texto','Este es mi texto de prueba');
    return assertTrue(c.consola.directorioActual.hijos[0] == undefined);
  });
  test('26 - Creador puede agregar permiso sobre su carpeta', (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    var usuario = new Usuario('usuario','usuario');
    c.consola.newUser(usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Textos');
    c.consola.agregarPermiso(usuario,'r',carpeta);
    c.consola.irA(carpeta);
    return assertEquals(c.consola.directorioActual.permisos[1][0],usuario);
  });
  test('27 - Usuario con permiso puede entrar a carpeta' , (c)=>{
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    var usuario = new Usuario('usuario','usuario');
    c.consola.newUser(usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Textos');
    c.consola.agregarPermiso(usuario,'r',carpeta);
    c.consola.logout();
    c.consola.login(usuario);
    c.consola.irA(carpeta);
    return assertEquals(c.consola.directorioActual.nombre,carpeta.nombre);
  });
  test('28 - Usuario owner puede quitar permiso' , (c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    var usuario = new Usuario('usuario','usuario');
    c.consola.newUser(usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Textos');
    c.consola.agregarPermiso(usuario,'r',carpeta);
    c.consola.irA(carpeta);
    c.consola.logout();
    c.consola.login(c.usuario);
    c.consola.irA(carpeta);
    c.consola.quitarPermiso(usuario,'r',carpeta);
    return assertEquals(c.consola.directorioActual.permisos[1],undefined);
  });
  test('29 - Puedo mover un archivo de un directorio a otro' , (c)=>{
    c.consola.login(c.rootUser);
    var carpeta = c.consola.mkdir('Textos');
    var carpeta2 = c.consola.mkdir('Videos');
    c.consola.irA(carpeta);
    var archivo = c.consola.escribirArchivo('Mi Texto','Este es mi texto de prueba');
    c.consola.mover(archivo,carpeta2);
    c.consola.irA(carpeta2);
    return assertTrue(c.consola.directorioActual.hijos[0] == archivo);
  });
  test('30 - Puedo mover una carpeta de un directorio a otro' , (c)=>{
    c.consola.login(c.rootUser);
    var carpeta = c.consola.mkdir('Fotos');
    var carpeta2 = c.consola.mkdir('Videos');
    c.consola.irA(carpeta);
    var carpetaMover = c.consola.mkdir('El Viaje');
    c.consola.mover(carpetaMover,carpeta2);
    c.consola.irA(carpeta2);
    return assertTrue(c.consola.directorioActual.hijos[0] == carpetaMover);
  });
});