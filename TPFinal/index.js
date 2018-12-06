require('oow');
const {
  suite,
  test,
  before,
  assertTrue,
  assertFalse,
  assertEquals,
} = require('@ngarbezza/testy');

const { Consola, Archivo, Directorio, Usuario } = require('./terminal');

suite('terminal', () => {
  before(() => {
    var raiz = new Directorio('raiz',null,null);
    var consola = new Consola(raiz);
    var usuario = new Usuario('tomas-n','clave');
    var rootUser = new Usuario('root-user','allaccess');
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
    }
  });
  
  test('01 - Inicialmente no hay ningun usuario logueado', (c) => {
    return assertTrue(c.consola.usuarioLogueado == null)
  });
  test('02 - Nos podemos loguear como root',(c) => {
    c.consola.login(c.rootUser);
    return assertTrue(c.consola.usuarioLogueado == c.rootUser)
  });
  test('03 - Si la contraseña de root esta mal no se puede loguear' ,(c) => {
    c.consola.login(c.rootWrongPassword);
    return assertTrue(c.consola.usuarioLogueado == null);
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
    c.consola.directorioActual.newElement(c.carpeta);
    return assertEquals(c.consola.directorioActual.hijos[0],c.carpeta)
  });
  test('07 - Ir a una carpeta en root', (c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
    console.log(c.consola.directorioActual);
    console.log(c.consola.directorioActual.hijos);
    c.consola.irA(c.carpeta);
    console.log(c.consola.directorioActual.padre);
    return assertTrue(c.consola.directorioActual == c.carpeta)
  });
  test('08 - Crear un archivo en la nueva carpeta', (c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
    c.consola.irA(c.carpeta);
    c.consola.directorioActual.newElement(c.archivo);
    return assertTrue(c.consola.directorioActual.hijos[0] == c.archivo)
  });
  test('09 - Ver el contenido del archivo creado', (c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
    c.consola.irA(c.carpeta);;
    c.consola.directorioActual.newElement(c.archivo);
    return assertEquals(c.consola.directorioActual.hijos[0].contenido, 'Mi nombre es Tomas y tengo 20 años')
  });
  test('10 - Borrar un archivo',(c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
    c.consola.irA(c.carpeta);;
    c.consola.directorioActual.newElement(c.archivo);
    c.consola.directorioActual.deleteElement(c.archivo);
    return assertTrue(c.consola.directorioActual.hijos.length == 0)
  });
  test('11 - Borrar una carpeta',(c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
    c.consola.directorioActual.deleteElement(c.carpeta);
    return assertTrue(c.consola.directorioActual.hijos.length == 0)
  });
  test('12 - Ir a la carpeta anterior sin indicar el nombre',(c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.carpeta);
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
    return assertTrue(c.consola.usuarioLogueado == null)
  });
  test('16 - Cuando se crea archivo o carpeta el usuario actual es dueño',(c) => {
    c.consola.login(c.rootUser);
    c.consola.newUser(c.usuario);
    c.consola.logout();
    c.consola.login(c.usuario);
    var carpeta = c.consola.mkdir('Fotos');
    c.consola.directorioActual.newElement(carpeta);
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
    return assertTrue(c.consola.usuarioLogueado == c.usuario)
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
    return assertTrue(c.consola.usuarioLogueado == null)
  });
  test('20 - Puedo editar un archivo existente', (c) => {
    c.consola.login(c.rootUser);
    c.consola.directorioActual.newElement(c.archivo);
    c.consola.editarArchivo(c.archivo,'Juan compra peras en la fruteria');
    return assertEquals(c.archivo.contenido, 'Juan compra peras en la fruteria');
  });
  test('21 - Si un usuario no respeta el formato no se crea', (c) => {
    c.consola.login(c.rootUser);
    return assertFalse(c.consola.newUser(new Usuario('name','123987')));
  });


});