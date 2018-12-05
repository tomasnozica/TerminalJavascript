require('oow/oow');
class Consola {
  constructor(){
    this.usuarios = []
    this.directorioActual = new Directorio('raiz',null);
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
    this.usuarios.push(usuario);
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
  back(){
    return this.padre;
  }
  irA(unDirectorio){
    this.directorioActual = unDirectorio;
  }
  validateUser(usuario){
    return this.usuarios.includes(usuario);
  }
  mkdir(DirectorioName){
    return new Directorio(DirectorioName,this.directorioActual,this.usuarioLogueado);
  }
}

class Archivo {
  constructor(nombre,contenido,owner){
    this.nombre = nombre;
    this.contenido = contenido;
    this.owner = owner;
  } 
}
class Directorio{
  constructor(fileName, padre, owner){
    this.nombre = fileName;
    this.padre = padre;
    this.hijos = [];
    this.owner = owner;
  }
  newElement(FileOrDirectory){
    this.hijos.push(FileOrDirectory);
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

}
class Usuario{
  constructor(user,password){
    this.user = user;
    this.password = password;
  }
}

module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario,
};