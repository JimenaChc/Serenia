CREATE DATABASE Serenia
Use Serenia
Select *From usuarios
CREATE TABLE Usuarios (
Id_Usuario INT PRIMARY KEY AUTO_INCREMENT,
Nombre VARCHAR(50),
Apellidos VARCHAR (50),
Correo VARCHAR(50) UNIQUE,
Contrasena NVARCHAR(10),
Telefono VARCHAR(15),
FotoPerfil TEXT
);

CREATE TABLE Tableros (
Id_Tablero INT PRIMARY KEY AUTO_INCREMENT,
Id_Usuario INT NOT NULL,
Titulo VARCHAR(50),
Descripcion VARCHAR(50),
FechaCreación DATE,
FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario) 
);

CREATE TABLE Imagenes (
Id_Imagen INT PRIMARY KEY AUTO_INCREMENT,
Url TEXT,
Titulo VARCHAR(25),
Descripcion VARCHAR(25),
Id_Categoria INT,
FOREIGN KEY (Id_Categoria) REFERENCES Categorias (Id_Categoria)
);

CREATE TABLE Categorias (
Id_Categoria INT PRIMARY KEY AUTO_INCREMENT,
Nombre VARCHAR(20)
);

CREATE TABLE ImagenesCotizacion (
Id_Imagen INT PRIMARY KEY AUTO_INCREMENT, 
Id_Cotizacion INT,
URL TEXT,
FOREIGN KEY (Id_Cotizacion) REFERENCES Cotizaciones(Id_Cotizacion)
);

CREATE TABLE ImagenesTableros(
Id_Tablero INT NOT NULL,
Id_Imagen INT NOT NULL,
PRIMARY KEY (Id_Tablero, Id_Imagen),
FOREIGN KEY (Id_Tablero) REFERENCES Tableros(Id_Tablero),
FOREIGN KEY (Id_Imagen) REFERENCES Imagenes (Id_Imagen)
);

CREATE TABLE MeGusta(
Id_Usuario INT NOT NULL,
Id_Imagen INT NOT NULL,
PRIMARY KEY(Id_Usuario, Id_Imagen),
FOREIGN KEY (Id_Usuario) REFERENCES Usuarios (Id_Usuario),
FOREIGN KEY (Id_Imagen) REFERENCES Imagenes(Id_Imagen)
);

CREATE TABLE Servicios(
Id_Servicio INT PRIMARY KEY AUTO_INCREMENT,
Descripción VARCHAR(20),
Estado BIT 
);

CREATE TABLE Espacios_Eventos(
Id_Espacio_Evento INT PRIMARY KEY AUTO_INCREMENT,
Descripcion VARCHAR(20),
Estado BIT
);

CREATE TABLE Cotizaciones (
Id_Cotizacion INT PRIMARY KEY AUTO_INCREMENT,
Id_Usuario INT,
Id_Servicio INT,
NombreProyecto VARCHAR(20),
Id_Espacio_Evento INT,
Descripcion VARCHAR(255),
Foto TEXT, 
Fecha DATE, 
MontoEstimado INT,
Estado ENUM ('En revisión','Aprobado', 'En desarrollo','Rechada', 'Terminado'),
Id_Tablero INT,
FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario),
FOREIGN KEY (Id_Servicio) REFERENCES Servicios(Id_Servicio),
FOREIGN KEY (Id_Espacio_evento) REFERENCES Espacios_Eventos(Id_Espacio_Evento),
FOREIGN KEY (Id_Tablero) REFERENCES Tableros(Id_Tablero) 
);


DELIMITER $$

CREATE PROCEDURE RegistrarUsuario(
    IN p_Nombre VARCHAR(50),
    IN p_Apellidos VARCHAR(50),
    IN p_Correo VARCHAR(50),
    IN p_Contrasena VARCHAR(255),
    IN p_Telefono VARCHAR(15)
)
BEGIN
    INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contrasena, Telefono)
    VALUES (p_Nombre, p_Apellidos, p_Correo, p_Contrasena, p_Telefono);
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE LoginUsuario(
    IN pCorreo VARCHAR(100)
)
BEGIN
    SELECT Id_Usuario, Nombre, Apellidos, Correo, Contrasena
    FROM Usuarios
    WHERE Correo = pCorreo;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AgregarImagen(
  IN mURL TEXT,
  IN mTitulo VARCHAR(25),
  IN mDescripcion VARCHAR(100),
  IN mIdCategoria INT
)
BEGIN 
    INSERT INTO imagenes (Url,Titulo,Descripcion,Id_Categoria)
    VALUES (mURL, mTitulo, mDescripcion, mIdCategoria);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CrearTablero(
  IN tId_Usuario INT,
  IN tTitulo VARCHAR(25),
  IN tDescripcion VARCHAR(100),
  IN tFechaCreación DATE
)
BEGIN 
    INSERT INTO tableros (Id_Usuario, Titulo,Descripcion,FechaCreación)
    VALUES (tId_Usuario,tTitulo,tDescripcion,tFechaCreacion);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AgregarImagenTablero(
  IN mId_Tablero INT,
  IN mId_Imagen INT
)
BEGIN 
    INSERT INTO imagenestableros (Id_Tablero, Id_Imagen)
    VALUES (mId_Tablero,mId_Imagen);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE TablerosUsuario(
IN tId_Usuario INT
)
BEGIN 
    Select Id_Tablero, Titulo, Descripcion, FechaCreación FROM Tableros WHERE Id_Usuario = tId_Usuario ORDER BY FechaCreación DESC;
END $$
DELIMITER ;
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063137/Esc_Hongo_hefogu.jpg","Hongo Rave","Selvatico, festival de musica",8)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063151/Crafted_Spaces_rprois.jpg","Wood Cocina","Cocina elegante ",1)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063151/41b8f7d8-4c12-43c0-86f3-50de2511b67d_pndmjc.jpg","Med house","Decoración de casa completa, espacios calidos",1)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063151/bb5c0de1-550d-4327-a8cd-3f76ee906c62_inb7x8.jpg","Futiger Room","Habitación moderna",2)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063150/kitchen_ideas_gk7dbi.jpg","Beige room","Comedor minimalista con detalles de textura",3)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063150/a1c3ff32-6c19-4125-be51-b3930a6ff200_tyesf6.jpg","Light Nature","Comedor organico, con muchas plantas que le dan un aire fresco y acogedor",3)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063149/94c904ac-40dc-476e-94cd-b3aedee2b2aa_nuy9ka.jpg","Restaurante Fantasy","Restaurante con aires de magia y fantasia!",6)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063149/LoungeBar_p6kiix.jpg","Elegant pure","Aires frescos, modernos y elegantes",6)  

CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063149/564971f2-04dc-4d34-93be-d50b99cc3ce5_hmfjhg.jpg","Red Velvet bath","Baño romantico, elgante con aires florales",5)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063149/interior_aesthetics_home_spxcpq.jpg","Comedor Climb","Cocina - comedor rustico pero moderno",3)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063148/8224737c-8303-4962-87d6-fdf50d8e22b8_mvphtx.jpg","Restaurante dom","Busca transmitirte, calma, serenidad y conexion",6)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063147/95edda32-e989-44fd-b3e9-9a73a888e779_nrqlby.jpg","Bath out","Te sentiras duchandote al aire libre",5)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063147/a21c4377-90bc-48c9-b96e-d4e9e78ac430_pj2jne.jpg","Confy Bath","Mucha luz natural, tenue y aires frescos",5)  
CALL AgregarImagen("https://res.cloudinary.com/dyxi3knlx/image/upload/v1760063146/All_Posts_Instagram_sftvyi.jpg","Retro Room","Habitación con toques retros y vintage sin olvidar la modernidad",2)  


Delete from imagenes where Id_Imagen = 2
Select * from usuarios
INSERT INTO categorias (Nombre) Values ("Habitacion")
INSERT INTO categorias (Nombre) Values ("Comedor")
INSERT INTO categorias (Nombre) Values ("Sala")
INSERT INTO categorias (Nombre) Values ("Baño")
INSERT INTO categorias (Nombre) Values ("Restaurante")
INSERT INTO categorias (Nombre) Values ("Concierto")
INSERT INTO categorias (Nombre) Values ("Festival de musica")
INSERT INTO categorias (Nombre) Values ("Pasarela")
INSERT INTO categorias (Nombre) Values ("Escenario")
INSERT INTO categorias (Nombre) Values ("VideoClip")
INSERT INTO categorias (Nombre) Values ("Set")












