require('oow/oow');
class Consola {
  constructor(directorioActual){
    this.usuarios = []
    this.directorioActual = directorioActual;
    this.usuarioLogueado = null;
  }
  login(usuario){
    if(this.validateUser(usuario)){
      this.usuarioLogueado = usuario;
    }
  }
  logout(){
    this.usuarioLogueado = null;
  }
  newUser(usuario){
    if(usuario.validacionDeFormato(usuario.user)){
      this.usuarios.push(usuario);
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
    if (this.usuarioLogueado.password == oldPass ){
      var index = this.usuarios.indexOf(this.usuarioLogueado);
      this.usuarios[index].password = newPass;
      this.usuarioLogueado = this.usuarios[index];
    }
  }
  validateUser(usuario){
    return this.usuarios.includes(usuario);
  }
  irA(unDirectorio){
    this.directorioActual = unDirectorio;
  }
  back(){
    return this.padre;
  }
  mkdir(directorioName){
    return new Directorio(directorioName,this.directorioActual,this.usuarioLogueado);
  }
  editarArchivo(archivo, contenidoNuevo){
    archivo.editar(contenidoNuevo);
  }
}

class Archivo {
  constructor(nombre,contenido,owner){
    this.nombre = nombre;
    this.contenido = contenido;
    this.owner = owner;
  }
  editar(nuevoContenido){
    this.contenido = nuevoContenido;
  } 
}

class Directorio{
  constructor(fileName, padre, owner){
    this.nombre = fileName;
    this.padre = padre;
    this.owner = owner;
    this.hijos = [];
  }
  deleteElement(FileOrDirectory){
    var index = this.hijos.indexOf(FileOrDirectory);
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
}
class Permiso{
  constructor(user,mode){
    this.user = user;
    this.mode = mode;
  }

}


module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario,
  Permiso: Permiso,
};