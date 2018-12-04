require('oow/oow');
class Consola {
  constructor(){
    this.usuarios = []
    this.sesion = false;
    this.directorioActual = new Directorio('raiz',null);
    this.usuarioLogueado = '';
  }
  login(usuario){
    this.sesion = this.inListOfUsers(usuario);
    this.usuarioLogueado = usuario;
    return this.sesion;
  }
  inListOfUsers(usuario){
    var i = this.usuarios.length;
    while (i--) {
        if (this.usuarios[i] == usuario) {
            return true;
        }
    }
    return false;
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
  back(){
    return this.padre;
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
  displayItems(){
    var i = this.hijos.length;
    if(i==0){console.log('No items')}
    while(i--){
      console.log(this.hijos[i].nombre);
    }
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
  changePassword(oldPass, newPass){
    if (this.password == oldPass){
      this.password = newPass;
    }
  }
}

module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario
};