SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `lunar_bet`
--

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE IF NOT EXISTS `event` (
  `matchID` int(11) NOT NULL AUTO_INCREMENT,
  `teamA` varchar(45) NOT NULL,
  `teamB` varchar(45) NOT NULL,
  `bet1` float DEFAULT NULL,
  `betX` float DEFAULT NULL,
  `bet2` float DEFAULT NULL,
  `moment` timestamp NULL DEFAULT NULL,
  `times` int(11) unsigned zerofill DEFAULT NULL,
  `sport` varchar(45) NOT NULL,
  PRIMARY KEY (`matchID`),
  UNIQUE KEY `matchID` (`matchID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`matchID`, `teamA`, `teamB`, `bet1`, `betX`, `bet2`, `moment`, `times`, `sport`) VALUES
(10, 'U Cluj', 'Real Madrid', 12.03, 6.9, 6.14, '2022-01-26 02:08:59', 00000000000, 'football'),
(11, 'Liverpool', 'Chelsea', 12.76, 14.21, 5.28, '2022-01-24 20:53:08', 00000000000, 'football'),
(12, 'Rapid', 'Bayern', 11.21, 13.59, 11.36, '2022-01-26 19:06:00', 00000000000, 'football'),
(13, 'III', 'AAA', 12.74, 14.68, 3.55, '2022-01-28 02:55:38', 00000000000, 'basket'),
(14, 'FFF', 'III', 10.58, 7.33, 7.13, '2022-01-23 14:14:25', 00000000000, 'basket'),
(15, 'AAA', 'CCC', 3.57, 3.04, 10.2, '2022-01-26 08:12:55', 00000000000, 'basket'),
(16, 't8', 't9', 13.61, 10.91, 3.02, '2022-01-21 02:44:08', 00000000001, 'tennis'),
(17, 't8', 't3', 9.13, 4.73, 6.89, '2022-01-27 05:13:06', 00000000000, 'tennis'),
(18, 't4', 't9', 5.58, 13.04, 5.23, '2022-01-17 06:40:55', 00000000001, 'tennis');

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE IF NOT EXISTS `results` (
  `resultID` int(11) NOT NULL AUTO_INCREMENT,
  `resultA` int(11) DEFAULT NULL,
  `resultB` int(11) DEFAULT NULL,
  `matchID` int(11) DEFAULT NULL,
  PRIMARY KEY (`resultID`),
  UNIQUE KEY `matchID` (`matchID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `results`
--

INSERT INTO `results` (`resultID`, `resultA`, `resultB`, `matchID`) VALUES
(1, 1, 11, 18);

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE IF NOT EXISTS `ticket` (
  `ticketID` int(11) NOT NULL AUTO_INCREMENT,
  `odds` float DEFAULT NULL,
  `betAmount` float DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ticketID`),
  UNIQUE KEY `ticketID_UNIQUE` (`ticketID`),
  KEY `userBet_idx` (`userID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`ticketID`, `odds`, `betAmount`, `userID`, `status`) VALUES
(2, 5.58, 50, 2, 'LOSE'),
(3, 13.61, 50, 2, 'PROGRESS');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_match_rel`
--

CREATE TABLE IF NOT EXISTS `ticket_match_rel` (
  `relID` int(11) NOT NULL AUTO_INCREMENT,
  `ticketID` int(11) NOT NULL,
  `matchID` int(11) NOT NULL,
  `bet_type` varchar(1) NOT NULL,
  PRIMARY KEY (`relID`),
  KEY `ticketID` (`ticketID`),
  KEY `matchID` (`matchID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `ticket_match_rel`
--

INSERT INTO `ticket_match_rel` (`relID`, `ticketID`, `matchID`, `bet_type`) VALUES
(2, 2, 18, '1'),
(3, 3, 16, '1');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `userID_UNIQUE` (`userID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `username`, `password`, `type`) VALUES
(2, 'test', 'test', 'client'),
(3, 'newClient', 'test', 'client'),
(4, 'newClient2', 'test', 'client'),
(5, 'newClient3', 'test', 'client'),
(6, 'admin', 'admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE IF NOT EXISTS `user_details` (
  `detailID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `balance` float DEFAULT NULL,
  PRIMARY KEY (`detailID`),
  UNIQUE KEY `detailID_UNIQUE` (`detailID`),
  KEY `userDetail_idx` (`userID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`detailID`, `userID`, `email`, `balance`) VALUES
(2, 2, 'andrei.stefanie@gmail.com', 1119.5),
(3, 3, 'test@newTest.com', 10),
(4, 4, 'test@newTest.com', 10),
(5, 5, 'test@newTest.com', 10);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `matchResult` FOREIGN KEY (`matchID`) REFERENCES `event` (`matchID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `userBet` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `ticket_match_rel`
--
ALTER TABLE `ticket_match_rel`
  ADD CONSTRAINT `match_rel` FOREIGN KEY (`matchID`) REFERENCES `event` (`matchID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `ticket_rel` FOREIGN KEY (`ticketID`) REFERENCES `ticket` (`ticketID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user_details`
--
ALTER TABLE `user_details`
  ADD CONSTRAINT `userDetail` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
