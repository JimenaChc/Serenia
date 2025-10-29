CREATE DATABASE TrabajoRemoto
Use TrabajoRemoto

CREATE TABLE Usuarios (
    Id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    NombreCompleto VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Rol ENUM('Administrador', 'Lider', 'Miembro') NOT NULL,
    Estado ENUM('Activo', 'Inactivo', 'Bloqueado') DEFAULT 'Activo',
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Proyectos (
    Id_Proyecto INT AUTO_INCREMENT PRIMARY KEY,
    NombreProyecto VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    FechaInicio DATE,
    FechaFin DATE,
    Estado ENUM('En curso', 'Finalizado', 'Pendiente') DEFAULT 'Pendiente',
    Id_Lider INT,
    FOREIGN KEY (Id_Lider) REFERENCES Usuarios(Id_Usuario)
);
ALTER TABLE tareas MODIFY COLUMN FechaAsignacion DATE DEFAULT NOW();
CREATE TABLE Tareas (
    Id_Tarea INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    FechaAsignacion DATE DEFAULT NOW(),
    FechaEntrega DATE,
    Estado ENUM('Pendiente', 'En progreso', 'Completada', 'Retrasada') DEFAULT 'Pendiente',
    Prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    Id_Proyecto INT,
    Id_Responsable INT,
    FOREIGN KEY (Id_Proyecto) REFERENCES Proyectos(Id_Proyecto),
    FOREIGN KEY (Id_Responsable) REFERENCES Usuarios(Id_Usuario)
);
 
 DROP Table Proyectos 
  DROP Table Usuarios
   DROP Table tareas
 Select *from tareas

CREATE TABLE Incidencias (
    Id_Incidencia INT AUTO_INCREMENT PRIMARY KEY,
    Id_Tarea INT,
    Id_Reportante INT,
    Descripcion TEXT,
    FechaReporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado ENUM('Abierta', 'En revisión', 'Resuelta') DEFAULT 'Abierta',
    FOREIGN KEY (Id_Tarea) REFERENCES Tareas(Id_Tarea),
    FOREIGN KEY (Id_Reportante) REFERENCES Usuarios(Id_Usuario)
);

CREATE TABLE Reuniones (
    Id_Reunion INT AUTO_INCREMENT PRIMARY KEY,
    Id_Proyecto INT,
    FechaReunion DATETIME NOT NULL,
    EnlaceReunion VARCHAR(255),
    Agenda TEXT,
    ResumenFinal TEXT,
    FOREIGN KEY (Id_Proyecto) REFERENCES Proyectos(Id_Proyecto)
);

CREATE TABLE Participantes_Reunion (
    Id_Participacion INT AUTO_INCREMENT PRIMARY KEY,
    Id_Reunion INT,
    Id_Usuario INT,
    Asistencia ENUM('Confirmada', 'Ausente', 'Pendiente') DEFAULT 'Pendiente',
    FOREIGN KEY (Id_Reunion) REFERENCES Reuniones(Id_Reunion),
    FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario)
);

CREATE TABLE Comentarios (
    Id_Comentario INT AUTO_INCREMENT PRIMARY KEY,
    Id_Usuario INT,
    Id_Tarea INT NULL,
    Id_Reunion INT NULL,
    Contenido TEXT NOT NULL,
    FechaComentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario),
    FOREIGN KEY (Id_Tarea) REFERENCES Tareas(Id_Tarea),
    FOREIGN KEY (Id_Reunion) REFERENCES Reuniones(Id_Reunion)
);

CREATE TABLE Archivos (
    Id_Archivo INT AUTO_INCREMENT PRIMARY KEY,
    NombreArchivo VARCHAR(150) NOT NULL,
    UrlArchivo VARCHAR(255) NOT NULL,
    Id_Tarea INT NULL,
    Id_Reunion INT NULL,
    SubidoPor INT,
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Id_Tarea) REFERENCES Tareas(Id_Tarea),
    FOREIGN KEY (Id_Reunion) REFERENCES Reuniones(Id_Reunion),
    FOREIGN KEY (SubidoPor) REFERENCES Usuarios(Id_Usuario)
);






