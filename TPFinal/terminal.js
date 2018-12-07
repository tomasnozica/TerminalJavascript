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
    var carpeta = new Directorio(directorioName,this.directorioActual,this.usuarioLogueado)
    this.addElement(carpeta);
    return carpeta;
  }
  editarArchivo(archivo, contenidoNuevo){
    if(this.autorizarAccion(this.usuarioLogueado)){
      archivo.editar(contenidoNuevo);
    };
  }
  addElement(FileOrDirectory){
    if(this.autorizarAccion(this.usuarioLogueado,'a')){
      this.directorioActual.newElement(FileOrDirectory);
    }
  };
  autorizarAccion(usuario,mode){
    return this.directorioActual.validar(usuario,mode);
  }
}
class Archivo {
  constructor(nombre,contenido,owner){
    this.nombre = nombre;
    this.contenido = contenido;
    this.owner = owner;
    this.permisos = [[owner,'a']];
  }
  editar(nuevoContenido){
    this.contenido = nuevoContenido;
  } 
}
class Directorio{
  constructor(fileName, padre, owner){
    this.nombre = fileName;
    this.padre = padre;
    this.hijos = [];
    this.owner = owner;
    this.permisos = [[owner,'a']];
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
  validar(usuario,mode){
    if (this.isRootUser(usuario)){return true}
    return this.recorrerArray(this.permisos,usuario,mode);
  }
  isRootUser(usuario){
    return usuario.user == 'root-user';
  }
  recorrerArray(arreglo,usuario,mode){
    for (var i = 0; i < arreglo.length; i++) {
      if(arreglo[i][0]==usuario && arreglo[i][1]==mode){
        return true;
      };
    };
  };

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


module.exports = {
  Consola: Consola,
  Archivo: Archivo,
  Directorio: Directorio,
  Usuario: Usuario,
};