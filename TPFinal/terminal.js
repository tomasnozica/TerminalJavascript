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
    if(usuario.validacionDeFormato(usuario.user) && this.usuarioLogueado.validacion()){
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
    if(this.permisoDeLectura(unDirectorio)){
      this.directorioActual = unDirectorio;
    }
  }
  back(){
    this.directorioActual = this.directorioActual.padre;
  }
  mkdir(directorioName){
    var carpeta = new Directorio(directorioName,this.directorioActual,this.usuarioLogueado)
    this.addElement(carpeta);
    return carpeta;
  }
  editarArchivo(archivo, contenidoNuevo){
    if(this.permisoDeEscritura(archivo)){
      archivo.editar(contenidoNuevo);
    };
  }
  leerArchivo(archivo){
    if(this.permisoDeLectura(archivo)){
      archivo.leer(contenidoNuevo);
    };
  }
  escribirArchivo(nombre,contenido){
    if(this.permisoDeEscritura(this.directorioActual)){
      var archivo = new Archivo(nombre,contenido,this.usuarioLogueado,this.directorioActual)
      this.addElement(archivo);
      return archivo;
    }
  }
  addElement(FileOrDirectory){
    if(this.permisoDeEscritura(this.directorioActual)){
      this.directorioActual.newElement(FileOrDirectory);
    }
  }
  eliminar(directorioName){
    if(this.permisoDeEscritura(this.directorioActual)){
      this.directorioActual.deleteElement(directorioName);
    }
  }
  autorizarAccion(usuario,mode,fileOrDirectory){
    return fileOrDirectory.validar(usuario,mode);
  }
  permisoDeEscritura(fileOrDirectory){
    return this.autorizarAccion(this.usuarioLogueado,'a',fileOrDirectory) || this.autorizarAccion(this.usuarioLogueado,'w',fileOrDirectory)
  }
  permisoDeLectura(fileOrDirectory){
    return this.autorizarAccion(this.usuarioLogueado,'a',fileOrDirectory) || this.autorizarAccion(this.usuarioLogueado,'r',fileOrDirectory)
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
  copiar(fileOrDirectory,destino){
    if(this.usuarioLogueado == fileOrDirectory.owner){
      fileOrDirectory.copy(destino);
    };
  };
}
class System {
  constructor(nombre,owner,padre){
    this.nombre = nombre;
    this.owner = owner;
    this.padre = padre;
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
  mover(destino){
    this.padre.deleteElement(this.nombre);
    this.padre = destino;
  } 
}
class Archivo extends System {
  constructor(nombre,contenido,owner,padre){
    super(nombre,owner,padre);
    this.contenido = contenido;
  }
  editar(nuevoContenido){
    this.contenido = nuevoContenido;
  }
  leer(){
    return this.contenido;
  }
  copy(destino){
    var archivoCopia = new Archivo(this.nombre,this.contenido,this.owner,destino);
    destino.newElement(archivoCopia);
  }
}
class Directorio extends System{
  constructor(fileName, padre, owner){
    super(fileName,owner,padre);
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
  copy(destino){
    var copiaCarpeta = new Directorio(this.nombre,destino,this.owner);
    this.copyHijos(copiaCarpeta);
    destino.newElement(copiaCarpeta);
  }
  copyHijos(object){
    for (var i = 0; i < this.hijos.length; i++) {
      object.newElement(this.hijos[i]);
    }
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
  validacion(){
    return this.user=='root-user' || this.user=='nulluser';
  }
}


module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario,
};