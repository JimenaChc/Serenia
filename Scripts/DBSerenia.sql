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


CREATE TABLE Tarjetas (
  NumTarjeta VARCHAR(20) NOT NULL UNIQUE,  
  Nombre VARCHAR(100),
  Telefono VARCHAR(15),
  CodigoSeguridad INT,
  Vencimiento CHAR(5),   -- formato MM/AA
  Saldo DECIMAL(10,2),
  PRIMARY KEY (NumTarjeta)
);

CREATE TABLE PagosTransacciones (
  IdPago INT AUTO_INCREMENT PRIMARY KEY,
  Id_Cotizacion INT NULL,
  Monto DECIMAL(10,2) NOT NULL,
  MetodoPago VARCHAR(20) NOT NULL, -- 'SIMP','TARJETA','PAYPAL'
  Estado VARCHAR(20) NOT NULL,     -- 'Pendiente','Completado','Fallido'
  Comprobante VARCHAR(100) NULL,    -- número/uuid de comprobante visible al usuario
  PayPalOrderId VARCHAR(100) NULL,  -- para PayPal real
  FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PayPalOrders (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  OrderId VARCHAR(100) NOT NULL UNIQUE,
  IdPago INT NULL,
  Monto DECIMAL(10,2),
  Estado VARCHAR(50),
  Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (IdPago) REFERENCES PagosTransacciones(IdPago) ON DELETE SET NULL
);

CREATE TABLE Tableros (
Id_Tablero INT PRIMARY KEY AUTO_INCREMENT,
Id_Usuario INT NOT NULL,
Titulo VARCHAR(50),
Descripcion VARCHAR(50),
FechaCreación DATE,
FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario) 
);

CREATE INDEX idx_tarjetas_telefono ON Tarjetas (Telefono);

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

CREATE TABLE ProgresoCotizacion (
  Id_Progreso INT AUTO_INCREMENT PRIMARY KEY,
  Id_Cotizacion INT NOT NULL,
  estado ENUM('Aprobada', 'En desarrollo', 'Finalizada') DEFAULT 'Aprobada',
  fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_Cotizacion) REFERENCES Cotizaciones(Id_Cotizacion)
);

CREATE TABLE ImagenesProgreso (
  Id_Imagen INT AUTO_INCREMENT PRIMARY KEY,
  Id_Cotizacion INT NOT NULL,
  url text,
  descripcion VARCHAR(255),
  fechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Id_Cotizacion) REFERENCES cotizaciones(Id_Cotizacion)
);

CREATE TABLE DetallesDisenio(
  Id_Detalle INT PRIMARY KEY AUTO_INCREMENT,
  Id_Cotizacion INT NOT NULL,
  EstiloDeseado VARCHAR(200),
  MaterialesDeseados VARCHAR(300),
  Id_Tablero INT NULL,
  FOREIGN KEY (Id_Cotizacion) REFERENCES cotizaciones(Id_Cotizacion)
);
  
CREATE TABLE pagosCotizaciones (
  Id_Pago INT PRIMARY KEY AUTO_INCREMENT,
  Id_Cotizacion INT NOT NULL,
  Monto DECIMAL(10,2),
  Estado ENUM('Pendiente','Completado') DEFAULT 'Pendiente',
  FechaPago DATETIME DEFAULT NOW(),
  FOREIGN KEY (Id_Cotizacion) REFERENCES cotizaciones(Id_Cotizacion)
);

CREATE TABLE Comentarios (
Id_Comentario INT PRIMARY KEY AUTO_INCREMENT,
Id_Cotizacion INT NOT NULL,
Id_Usuario INT,
Mensaje VARCHAR(255),
Fecha DATETIME DEFAULT NOW(),
FOREIGN KEY (Id_Cotizacion) REFERENCES cotizaciones(Id_Cotizacion) 
);

CREATE TABLE VerificacionesCorreo (
  Id_Verificacion INT AUTO_INCREMENT PRIMARY KEY,
  Correo VARCHAR(150) NOT NULL,
  Token VARCHAR(100) NOT NULL,
  FechaCreacion DATETIME NOT NULL
);

CREATE TABLE Acciones (
    Id_Accion INT PRIMARY KEY AUTO_INCREMENT,
    NombreAccion VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(255)
);

CREATE TABLE Auditoria (
    Id_Auditoria INT PRIMARY KEY AUTO_INCREMENT,
    Id_Usuario INT NULL,
    Id_Accion INT NOT NULL,
    Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    Descripcion TEXT,
    
    FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario),
    FOREIGN KEY (Id_Accion) REFERENCES Acciones(Id_Accion)
);

CREATE TABLE ubicaciones (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Descripcion VARCHAR(100) NOT NULL,
  Dependencia INT NULL,
  FOREIGN KEY (Dependencia) REFERENCES ubicaciones(Id)
);


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

CREATE PROCEDURE ObtenerUsuario(
    IN pId_Usuario INT
)
BEGIN
    SELECT * FROM Usuarios WHERE Id_Usuario = pId_Usuario;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ActualizarDatosUsuario(
    IN p_Nombre VARCHAR(50),
    IN p_Apellidos VARCHAR (50),
    IN p_Telefono VARCHAR(15),
    IN p_Correo VARCHAR(50),
    IN p_Contrasena VARCHAR(255)
)
BEGIN
    UPDATE Usuarios  SET Nombre = p_Nombre, Apellidos = p_Apellidos, Correo = p_Correo, Contrasena = p_Contrasena, Telefono = p_Telefono;
    
END $$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ActualizarFotoPerfil(
    IN p_Id_Usuario INT,
    IN p_Foto TEXT
)
BEGIN
    UPDATE Usuarios  SET FotoPerfil = p_Foto
    WHERE Id_Usuario = p_Id_Usuario;
END $$

DELIMITER ;
Select * From Usuarios
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
    SELECT LAST_INSERT_ID() AS Id_Tablero;
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

DELIMITER $$
CREATE PROCEDURE RegistrarLike(
  IN mId_Usuario INT,
  IN mId_Imagen INT
)
BEGIN 
    INSERT INTO megusta (Id_Usuario, Id_Imagen)
    VALUES (mId_Usuario,mId_Imagen);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ImagenesTableros(
IN tId_Tablero INT
)
BEGIN 
    SELECT i.Id_Imagen, i.Url, i.Titulo, i.Descripcion
    FROM Imagenes i
    JOIN imagenestableros it ON i.Id_Imagen = it.Id_Imagen
    WHERE it.Id_Tablero = tId_Tablero;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE LikesPorUsuario(
IN tId_Usuario INT
)
BEGIN 
    SELECT i.Id_Imagen, i.Url, i.Titulo, i.Descripcion
    FROM Imagenes i
    INNER JOIN megusta l ON i.Id_Imagen = l.Id_Imagen
    WHERE l.Id_Usuario = tId_Usuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE CrearCotizacion(
  IN cId_Usuario INT,
  IN cId_Servicio INT,
  IN cNombreProyecto VARCHAR(100),
  IN cId_Espacio_Evento INT,
  IN cDescripción TEXT,
  IN cMontoEstimado DECIMAL,
  IN cEstado VARCHAR(25),
  IN cId_Tablero INT
)
BEGIN 
    INSERT INTO cotizaciones (Id_Usuario, Id_Servicio,NombreProyecto,Id_Espacio_Evento,Descripcion,Fecha,MontoEstimado,Estado,Id_Tablero)
    VALUES (cId_Usuario,cId_Servicio,cNombreProyecto,cId_Espacio_Evento,cDescripcion,NOW(),cMontoEstimado,cEstado,cId_Tablero);
    SELECT LAST_INSERT_ID() AS Id_Cotizacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AgregarImagenCotizacion(
  IN cId_Cotizacion INT,
  IN cUrl text
)
BEGIN 
     INSERT INTO ImagenesCotizacion (Id_Cotizacion, URL)
    VALUES (cId_Cotizacion,cUrl );
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ObtenerCotizaciones(
IN tId_Usuario INT
)
BEGIN 
    SELECT 
      c.Id_Cotizacion,
      c.NombreProyecto,
      c.Descripcion,
      c.MontoEstimado,
      c.Estado,
      c.Fecha,
      s.Descripcion AS Servicio,
      GROUP_CONCAT(i.URL) AS Imagenes
    FROM Cotizaciones c
    LEFT JOIN Servicios s ON c.Id_Servicio = s.Id_Servicio
    LEFT JOIN ImagenesCotizacion i ON c.Id_Cotizacion = i.Id_Cotizacion
    WHERE c.Id_Usuario = tId_Usuario
    GROUP BY c.Id_Cotizacion
    ORDER BY c.Fecha DESC;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ObtenerProgresoCotizaciones(
IN tId_Cotizacion INT
)
BEGIN 
    SELECT p.*, GROUP_CONCAT(i.url) AS Imagenes
    FROM ProgresoCotizacion p
    LEFT JOIN ImagenesProgreso i ON p.Id_Progreso = i.Id_Progreso
    WHERE p.Id_Cotizacion = tId_Cotizacion
    GROUP BY p.Id_Progreso;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE listaServicios(
)
BEGIN 
    SELECT Id_Servicio, Descripcion FROM Servicios WHERE Estado = 1;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE listaEspaciosEventos(
)
BEGIN 
    SELECT Id_Categoria, Nombre FROM Categorias;
END $$
DELIMITER ;



ALTER TABLE Cotizaciones
MODIFY COLUMN Estado ENUM('En revisión','Aprobada','En desarrollo','Rechazada','Terminada') DEFAULT 'En revisión';


DELIMITER $$
CREATE TRIGGER tr_actualizar_estado_cotizacion
AFTER INSERT ON ProgresoCotizacion
FOR EACH ROW
BEGIN
  UPDATE Cotizaciones
  SET Estado = NEW.estado
  WHERE Id_Cotizacion = NEW.Id_Cotizacion;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ObtenerProgresoPorCotizacion(IN p_Id_Cotizacion INT)
BEGIN
  SELECT 
    p.Id_Progreso,
    p.estado,
    p.descripcion,
    p.montoActual,
    p.fechaActualizacion,
    GROUP_CONCAT(i.url) AS Imagenes
  FROM ProgresoCotizacion p
  LEFT JOIN ImagenesProgreso i ON p.Id_Progreso = i.Id_Progreso
  WHERE p.Id_Cotizacion = p_Id_Cotizacion
  GROUP BY p.Id_Progreso
  ORDER BY p.fechaActualizacion ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE guardarDetallesDisenio(
  IN cId_Cotizacion INT,
  IN cEstiloDeseado VARCHAR(200),
  IN cMaterialesDeseados VARCHAR(300),
  IN cId_Tablero INT
)
BEGIN 
     INSERT INTO detallesdisenio (Id_Cotizacion, EstiloDeseado, MaterialesDeseados, Id_Tablero)
    VALUES (cId_Cotizacion, cEstiloDeseado, cMaterialesDeseados, cId_Tablero);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE registrarPago(
  IN cId_Cotizacion INT,
  IN cMonto DECIMAL(10,2),
  IN cEstado Varchar(10)
)
BEGIN 
         INSERT INTO pagosCotizaciones (Id_Cotizacion, Monto, Estado)
         VALUES (cId_Cotizacion,cMonto,cEstado);

END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ObtenerCotizacion(IN pId_Cotizacion INT)
BEGIN
  SELECT 
      c.Id_Cotizacion,
      c.NombreProyecto,
      c.Descripcion,
      c.MontoEstimado,
      c.Estado,
      s.Descripcion AS Servicio,
      e.Nombre AS Espacio,
      GROUP_CONCAT(i.UrlImagen) AS Imagenes
    FROM Cotizaciones c
    LEFT JOIN Servicios s ON c.Id_Servicio = s.Id_Servicio
    LEFT JOIN categorias k ON c.Id_Categoria = k.Id_Categoria
    LEFT JOIN ImagenesCotizacion i ON c.Id_Cotizacion = i.Id_Cotizacion
    WHERE c.Id_Cotizacion = pId_Cotizacion
    GROUP BY c.Id_Cotizacion;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE imagenesProgreso(IN iId_Cotizacion INT)
BEGIN 
    SELECT Id_Imagen, url, descripcion, fechaSubida FROM ImagenesProgreso WHERE Id_Cotizacion = iId_Cotizacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE listaComentarios(
    IN iId_Cotizacion INT
)
BEGIN
    SELECT * FROM Comentarios WHERE Id_Cotizacion = iId_Cotizacion ORDER BY Fecha ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE registrarComentario(
  IN cId_Cotizacion INT,
  IN cId_Usuario INT,
  IN cMensaje Varchar(255)
)
BEGIN 
         INSERT INTO Comentarios (Id_Cotizacion, Id_Usuario, Mensaje)
         VALUES (cId_Cotizacion,cId_Usuario,cMensaje);

END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE validarSecretFA(
    IN iCorreo varchar(255)
)
BEGIN
    SELECT SecretFA FROM Usuarios WHERE Correo = iCorreo;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE guardarSecretFA(
    IN pId_Usuario INT,
    IN pSecretFA VARCHAR(255)
)
BEGIN
    UPDATE Usuarios  SET SecretFA = pSecretFA where Id_Usuario = pId_Usuario;
    
END $$

DELIMITER ;
INSERT INTO Acciones (Id_Accion, NombreAccion, Descripcion) VALUES
(14, 'Actualizacion de contraseña', 'Se actualizó la contraseña');
(1, 'Registrar Usuario', 'Un usuario se registró en la plataforma'),
(2, 'Login Usuario', 'Un usuario inició sesión'),
(3, 'Actualizar Datos Usuario', 'El usuario actualizó su información personal'),
(4, 'Actualizar Foto Perfil', 'El usuario actualizó su foto de perfil'),

(5, 'Crear Tablero', 'El usuario creó un tablero'),
(6, 'Agregar Imagen General', 'Se agregó una imagen al sistema'),
(7, 'Agregar Imagen a Tablero', 'El usuario agregó una imagen a un tablero'),

(8, 'Registrar Like', 'El usuario dio like a una imagen'),

(9, 'Crear Cotización', 'Se creó una cotización'),
(10, 'Agregar Imagen a Cotización', 'Se agregó imagen a cotización'),

(11, 'Registrar Pago', 'Se registró un pago en una cotización'),
(12, 'Registrar Detalles de Diseño', 'Se guardaron detalles de diseño'),

(13, 'Actualizar Progreso Cotización', 'Se actualizó el estado del progreso de una cotización');
(14, 'Actualizacion de contraseña', 'Se actualizó la contraseña');


DELIMITER $$

CREATE FUNCTION fn_ObtenerUsuarioPorCorreo(pCorreo VARCHAR(100))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE vIdUsuario INT;

    SELECT Id_Usuario INTO vIdUsuario
    FROM Usuarios
    WHERE Correo = pCorreo
    LIMIT 1;

    RETURN vIdUsuario;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_RegistrarAuditoria(
    IN pIdUsuario INT,
    IN pIdAccion INT,
    IN pDescripcion TEXT
)
BEGIN
    INSERT INTO Auditoria (Id_Usuario, Id_Accion, Descripcion)
    VALUES (pIdUsuario, pIdAccion, pDescripcion);
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AgregarImagenCotizacion(
  IN pId_Cotizacion INT,
  IN pUrlImagen VARCHAR(255)
)
BEGIN
  INSERT INTO imagenescotizacion (Id_Cotizacion, URL)
  VALUES (pId_Cotizacion, pUrlImagen);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE AgregarImagenTablero(
  IN pId_Tablero INT,
  IN pId_Imagen INT
)
BEGIN
  INSERT INTO imagenestableros (Id_Tablero,Id_Imagen)
  VALUES (pId_Tablero, pId_Imagen);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE ActualizarContrasena(
  IN pCorreo VARCHAR(255),
  IN pNuevaContrasena TEXT
)
BEGIN
  DECLARE vId INT;

  -- Obtener ID del usuario
  SELECT Id_Usuario INTO vId FROM usuarios WHERE Correo = pCorreo;

  -- Si el usuario existe, actualiza su contraseña
  IF vId IS NOT NULL THEN
    UPDATE usuarios
    SET Contrasena = pNuevaContrasena
    WHERE Id_Usuario = vId;

    -- Registrar auditoría
    CALL sp_RegistrarAuditoria(
      vId,
      14,
      CONCAT('cambió la contraseña por recuperación')
    );
  END IF;
END$$

DELIMITER $$
CREATE PROCEDURE IncrementarIntentos(IN pCorreo VARCHAR(255))
BEGIN
  UPDATE usuarios
  SET IntentosFallidos = IntentosFallidos + 1
  WHERE Correo = pCorreo;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE BloquearUsuario(IN pCorreo VARCHAR(255))
BEGIN
  UPDATE usuarios
  SET Bloqueado = 'Bloqueado'
  WHERE Correo = pCorreo;
END$$
DELIMITER ;


CALL IncrementarIntentos('Tamy@gmail.com')
select *from pagoscotizaciones
use serenia
select *from cotizaciones
Update Usuarios Set contrasena = '123' where Id_Usuario = 3;
Update Usuarios Set contrasena = '123' where Id_Usuario = 4;
Update Usuarios Set contrasena = '123' where Id_Usuario = 5;
Update Usuarios Set contrasena = '123' where Id_Usuario = 6;
Update Usuarios Set contrasena = '123' where Id_Usuario = 7;
Update Usuarios Set contrasena = '123' where Id_Usuario = 8;
Update Usuarios Set contrasena = '123' where Id_Usuario = 9;
Update Usuarios Set contrasena = '123' where Id_Usuario = 10;
Update Usuarios Set contrasena = '123' where Id_Usuario = 11;
Update Usuarios Set contrasena = '123' where Id_Usuario = 12;
ALTER TABLE Usuarios MODIFY Contrasena VARCHAR(100) NOT NULL;
Select *from usuarios

CALL RegistrarUsuario('Micaela', 'Stone', 'mica@example.com', '123456', '88888888', 'Costa Rica, San José, Escazú, San Rafael');

DELIMITER $$
CREATE PROCEDURE descontarSaldo(
  IN pNumTarjeta VARCHAR(20),
  IN pMonto DECIMAL(10,2),
  OUT pResultado VARCHAR(50)
)
proc_label: BEGIN   -- <<< ESTA ES LA ETIQUETA CORRECTA
  DECLARE vSaldo DECIMAL(10,2);
  DECLARE vNewSaldo DECIMAL(10,2);

  START TRANSACTION;

  -- Bloqueo de la fila para evitar problemas de concurrencia
  SELECT Saldo 
  INTO vSaldo 
  FROM Tarjetas 
  WHERE NumTarjeta = pNumTarjeta 
  FOR UPDATE;

  -- No existe
  IF vSaldo IS NULL THEN
    SET pResultado = 'NO_EXISTE';
    ROLLBACK;
    LEAVE proc_label;   -- <<< AHORA FUNCIONA
  END IF;

  -- No alcanza el saldo
  IF vSaldo < pMonto THEN
    SET pResultado = 'SALDO_INSUFICIENTE';
    ROLLBACK;
    LEAVE proc_label;
  END IF;

  -- Descontar
  SET vNewSaldo = vSaldo - pMonto;

  UPDATE Tarjetas 
  SET Saldo = vNewSaldo 
  WHERE NumTarjeta = pNumTarjeta;

  COMMIT;
  SET pResultado = 'OK';

END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS descontarSaldo;


Select *from cotizaciones
INSERT INTO Tarjetas (NumTarjeta, Nombre, Telefono, CodigoSeguridad, Vencimiento, Saldo)
VALUES
('4213 5589 7744 1201', 'Andrea Solís Vargas', '88881122', '314', '04/27', 45300),
('5320 9913 4478 2245', 'Carlos Méndez Rojas', '71129044', '802', '11/26', 32000),
('4485 2201 5634 9810', 'Jimena Chacón', '85330021', '129', '08/28', 12750),
('6011 7745 9981 3340', 'Luis Herrera Castro', '70015620', '443', '02/30', 8900),
('4539 8821 1200 6672', 'María Fernanda López', '87449912', '557', '07/27', 102500),
('4788 2201 9900 3312', 'Rafael Araya Murillo', '88776601', '238', '05/29', 21500),
('5367 1188 4422 5009', 'Daniela Mora Céspedes', '87339001', '901', '12/26', 50300),
('4481 9920 1044 7822', 'Sofía Arrieta Ramírez', '88912210', '774', '09/29', 15800),
('6011 7788 3341 1012', 'Jorge Salazar Muñoz', '70129933', '623', '01/30', 9200),
('4532 5500 6644 7811', 'Valeria González Soto', '83504421', '506', '06/27', 76400);
















