require('@pmoo/oow');
class Consola {
  constructor(directorioActual){
    this.usuarios = []
    this.directorioActual = directorioActual;
    this.usuarioLogueado = new Usuario('nulluser','nullpass');;
  }
  login(usuario){
    if(this.validateUser(usuario)){
      this.usuarioLogueado = usuario;
    }
  }
  logout(){
    this.usuarioLogueado = new Usuario('nulluser','nullpass');;
  }
  newUser(usuario){
    if(usuario.validacionDeFormato(usuario.user)){
      this.usuarios.push(usuario);
      this.directorioActual.permisos.push([usuario,'a']);
      return true;
    }
    return false;
  }
  deleteUser(usuario){
    var index = this.usuarios.indexOf(usuario);
    if (index > -1) {
      this.usuarios.splice(index, 1);
    }
  }
  changeUserPassword(oldPass,newPass){
    this.usuarioLogueado.changePass(oldPass,newPass);
  }
  validateUser(usuario){
    return this.usuarios.includes(usuario);
  }
  irA(unDirectorio){
    if(this.permisoDeLectura()){
      this.directorioActual = unDirectorio;
    }
  }
  back(){
    return this.padre;
  }
  mkdir(directorioName){
    var carpeta = new Directorio(directorioName,this.directorioActual,this.usuarioLogueado)
    this.addElement(carpeta);
    return carpeta;
  }
  editarArchivo(archivo, contenidoNuevo){
    if(this.permisoDeEscritura()){
      archivo.editar(contenidoNuevo);
    };
  }
  leerArchivo(archivo){
    if(this.permisoDeLectura()){
      archivo.leer(contenidoNuevo);
    };
  }
  escribirArchivo(nombre,contenido){
    if(this.permisoDeEscritura()){
      var archivo = new Archivo(nombre,contenido,this.usuarioLogueado)
      this.addElement(archivo);
      return archivo;
    }
  }
  addElement(FileOrDirectory){
    if(this.permisoDeEscritura()){
      this.directorioActual.newElement(FileOrDirectory);
    }
  }
  eliminar(directorioName){
    if(this.permisoDeEscritura()){
      this.directorioActual.deleteElement(directorioName);
    }
  }
  autorizarAccion(usuario,mode){
    return this.directorioActual.validar(usuario,mode);
  }
  permisoDeEscritura(){
    return this.autorizarAccion(this.usuarioLogueado,'a') || this.autorizarAccion(this.usuarioLogueado,'w')
  }
  permisoDeLectura(){
    return this.autorizarAccion(this.usuarioLogueado,'a') || this.autorizarAccion(this.usuarioLogueado,'r')
  }
  agregarPermiso(usuario,modo,fileOrDirectory){
    if(this.usuarioLogueado == fileOrDirectory.owner){
      fileOrDirectory.nuevoPermiso(usuario,modo);
    }
  }
  quitarPermiso(usuario,modo,fileOrDirectory){
    if(this.usuarioLogueado == fileOrDirectory.owner){
      fileOrDirectory.quitarPermiso(usuario,modo);
    }
  }
  mover(fileOrDirectory,destino){
    if(this.usuarioLogueado == fileOrDirectory.owner){
      fileOrDirectory.mover(destino);
      destino.newElement(fileOrDirectory);
    }
  }
}
class System {
  constructor(nombre,owner){
    this.nombre = nombre;
    this.owner = owner;
    this.permisos = [[owner,'a']];
  }
  validar(usuario,mode){
    if (this.isRootUser(usuario)){return true}
    return this.recorrerArray(this.permisos,usuario,mode)>=0;
  }
  isRootUser(usuario){
    return usuario.user == 'root-user';
  }
  recorrerArray(arreglo,usuario,mode){
    for (var i = 0; i < arreglo.length; i++) {
      if(arreglo[i][0]==usuario && arreglo[i][1]==mode){
        return i;
      };
    };
  }
  nuevoPermiso(usuario,modo){
    this.permisos.push([usuario,modo]);
  }
  quitarPermiso(usuario,modo){
    var index = this.recorrerArray(this.permisos,usuario,modo)
    if (index > -1) {
      this.permisos.splice(index, 1);
    }
  }
}
class Archivo extends System {
  constructor(nombre,contenido,owner){
    super(nombre,owner);
    this.contenido = contenido;
  }
  editar(nuevoContenido){
    this.contenido = nuevoContenido;
  }
  leer(){
    return this.contenido;
  }
  mover(destino){
    this.padre = destino;
  } 
}
class Directorio extends System{
  constructor(fileName, padre, owner){
    super(fileName,owner);
    this.padre = padre;
    this.hijos = [];
  }
  deleteElement(FileOrDirectoryName){
    var index = this.retornaElHijo(FileOrDirectoryName);
    if (index > -1) {
      this.hijos.splice(index, 1);
    }
  }
  back(){
    return this.padre;
  }
  newElement(FileOrDirectory){
    this.hijos.push(FileOrDirectory);
  }
  retornaElHijo(nombre){
    for (var i = 0; i < this.hijos.length; i++) {
      if(this.hijos[i].nombre==nombre){
        return i;
      };
    };
  }
  mover(destino){
    this.padre.deleteElement(this.nombre);
    this.padre = destino;
  }
}
class Usuario{
  constructor(user,password){
    this.user = user;
    this.password = password;
  }
  validacionDeFormato(user){
    let patron = /^[a-z0-9\-\_]{6,25}$/;
    return patron.test(user);
  }
  changePass(oldPass,newPass){
    if(this.password == oldPass){
      this.password = newPass;
    }
  }
}


module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario,
};