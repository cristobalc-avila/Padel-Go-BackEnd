-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-08-2022 a las 04:22:52
-- Versión del servidor: 10.4.21-MariaDB
-- Versión de PHP: 8.0.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gopadel`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cancha`
--

CREATE TABLE `cancha` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cancha`
--

INSERT INTO `cancha` (`id`, `nombre`, `estado`) VALUES
(1, 'Cancha 1', 'DISPONIBLE'),
(2, 'Cancha 2', 'DISPONIBLE'),
(3, 'Cancha 3', 'DISPONIBLE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `idCancha` int(11) NOT NULL,
  `nivel` int(11) NOT NULL,
  `jugador1` varchar(255) NOT NULL,
  `jugador2` varchar(255) DEFAULT NULL,
  `jugador3` varchar(255) DEFAULT NULL,
  `jugador4` varchar(255) DEFAULT NULL,
  `fecha` varchar(64) NOT NULL,
  `horaInicio` varchar(128) NOT NULL,
  `estado` varchar(255) DEFAULT 'RESERVADA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`idCancha`, `nivel`, `jugador1`, `jugador2`, `jugador3`, `jugador4`, `fecha`, `horaInicio`, `estado`) VALUES
(1, 5, '12314123-3', NULL, NULL, NULL, '2022-08-04', '08:00 AM', 'RESERVADA'),
(1, 4, '12314123-3', NULL, NULL, NULL, '2022-08-05', '12:00 AM', 'RESERVADA'),
(2, 4, '12314123-3', NULL, NULL, NULL, '2022-08-04', '08:00 AM', 'RESERVADA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `rut` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `sexo` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `clave` char(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nivel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`rut`, `nombre`, `apellido`, `sexo`, `correo`, `clave`, `nivel`) VALUES
('12314123-3', 'Pablete', 'Chavez', 'masculino', 'pablete@gmail.com', '$2b$10$zK99xNsQsz8XjsEJ9LQGCuKwCKMLq3v3wxL0SHGCfXH3xNDCJlxs6', 1),
('Prueba', 'Prueba', 'Prueba', 'Femenino', 'Prueba', '$2b$10$HTAdidy9kizGsrYGqLxtD.AnN6Yo7i2pU8E7CMbYF8h2fteq8fieK', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cancha`
--
ALTER TABLE `cancha`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`idCancha`,`horaInicio`),
  ADD KEY `jugador1` (`jugador1`),
  ADD KEY `jugador2` (`jugador2`),
  ADD KEY `jugador3` (`jugador3`),
  ADD KEY `jugador4` (`jugador4`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`rut`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`idCancha`) REFERENCES `cancha` (`id`),
  ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`jugador1`) REFERENCES `usuarios` (`rut`),
  ADD CONSTRAINT `reserva_ibfk_3` FOREIGN KEY (`jugador2`) REFERENCES `usuarios` (`rut`),
  ADD CONSTRAINT `reserva_ibfk_4` FOREIGN KEY (`jugador3`) REFERENCES `usuarios` (`rut`),
  ADD CONSTRAINT `reserva_ibfk_5` FOREIGN KEY (`jugador4`) REFERENCES `usuarios` (`rut`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
