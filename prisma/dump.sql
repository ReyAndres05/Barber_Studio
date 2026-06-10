BEGIN;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'cliente',
    image TEXT,
    needsPasswordChange BOOLEAN NOT NULL DEFAULT false,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de barberos
CREATE TABLE IF NOT EXISTS barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    rating REAL NOT NULL DEFAULT 5.0,
    reviewsCount INTEGER NOT NULL DEFAULT 0,
    bio TEXT NOT NULL,
    image TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    availableDays TEXT NOT NULL
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    duration INTEGER NOT NULL,
    category TEXT NOT NULL
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    serviceId TEXT NOT NULL,
    barberId TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reservations_barberId_fkey FOREIGN KEY (barberId) REFERENCES barbers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT reservations_serviceId_fkey FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT reservations_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Inserts de barberos
INSERT INTO barbers VALUES 
('cmq64u8wl0006va8cpe213nv2','Alexander Pierce','Master Barber & Fundador',4.9,142,'Con más de 12 años perfeccionando el arte de la barbería tradicional en Londres y Nueva York.','alexander-pierce','active','1,2,3,4,5,6'),
('cmq64u8wm0007va8cyg23hipg','Mateo Silva','Especialista en Estilo Urbano',4.8,98,'Un artista en el degradado (fade) y las texturas modernas. Mateo siempre está al día con las últimas tendencias de street style urbano y cortes creativos estructurados.','mateo-silva','active','1,2,3,4,5'),
('cmq64u8wm0008va8ca8shv005','Marcus Vance','Grooming & Beard Expert',4.9,115,'Marcus trata la barba como una escultura. Su precisión matemática en el delineado y sus amplios conocimientos en cuidado de la piel masculina garantizan una barba perfecta y saludable.','marcus-vance','active','2,3,4,5,6');

-- Inserts de servicios
INSERT INTO services VALUES
('cmq69mae60001va5on98r6vxv','Corte de Pelo Imperial','Asesoramiento de estilo, lavado con champú premium, corte personalizado a tijera/máquina, toalla caliente y peinado final con pomada orgánica.',35000.0,45,'corte'),
('cmq69mae60002va5o86bvt8rl','Esculpido de Barba & Ritual','Diseño de barba con máquina y tijera, afeitado de contornos a navaja con toallas calientes aromatizadas, bálsamos de hidratación profunda y masaje relajante.',25000.0,30,'barba'),
('cmq69mae60003va5ohwmqijg9','Afeitado Clásico a Navaja','Ritual tradicional para cara completa. Doble toalla caliente, espuma caliente batida a brocha de pelo de tejón, afeitado clásico, toalla fría y loción calmante.',30000.0,40,'barba'),
('cmq69mae60004va5opz2yvp0b','Tratamiento Facial Exfoliante','Limpieza facial profunda con vapor de ozono, exfoliación con micropartículas de carbón activo, mascarilla purificante y masaje hidratante de rostro.',40000.0,30,'facial'),
('cmq69mae60005va5o6jk4nb5i','Experiencia Studio Full (Combo)','El servicio definitivo: Corte de Pelo Imperial + Esculpido de Barba & Ritual + Mascarilla Facial Exfoliante de Carbón Activo. Bebida de cortesía incluida.',80000.0,90,'combo');

-- Inserts de usuarios
INSERT INTO users VALUES
('cmq64u8w10000va8cxg9v1kly','Administrador Principal','admin@barberstudio.com','$2b$10$6B3l8gILIHrfRXfoNxgIK.focIW52RuDBroBbdvgMRzYrz/m0ZlXq','1234567890',NULL,'admin',NULL,false,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cmq6a2ve50000vabszi700civ','Elvis Peña','penaelvis@gmail.com','$2b$10$ksE.VV7oXYc.x7apSkuXPu.VEznzfwxebXkfRDMMXH2jXegjUbX1y','3101234567',NULL,'cliente',NULL,false,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Insert de reserva
INSERT INTO reservations VALUES 
('cmq6a7b5h0002vabs9lt96upa','cmq6a2ve50000vabszi700civ','cmq69mae60001va5on98r6vxv','cmq64u8wm0008va8ca8shv005','2026-06-11','10:00',35000.0,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

COMMIT;
