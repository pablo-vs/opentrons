import unittest
from compilers import pfusx

class PFUSXTest(unittest.TestCase):

	def test_dna_to_rvd(self):
		"""
		Translate DNA to RVD pairs.
		"""
		expected = 'NI NG NI HD HD NN NG HD NG NG NI NG NG NG NG'
		rvd = pfusx.dna_to_rvd('ATACCGTCTTATTTT')
		self.assertEqual(rvd, expected)

	def test_dna_to_rvd_allow_unspecified_purine(self):
		"""
		Translate DNA to RVD pairs with unspecified purines.
		"""
		expected = 'NI NG NI HD HD NN NG HD NG NG NI NG NG NG NG'
		rvd = pfusx.dna_to_rvd('ATACCRTCTTATTTT')
		self.assertEqual(rvd, expected)

	def test_dna_to_rvd_disallow_unspecified_pyrimidines(self):
		"""
		Translate DNA to RVD pairs only with specified pyrimidines.
		"""
		with self.assertRaises(ValueError):
			pfusx.dna_to_rvd('AYACCGTCTTATTTT')

	def test_dna_to_rvd_invalid_character(self):
		"""
		Translate DNA to RCD pairs, minus invalid characters.
		"""
		with self.assertRaises(ValueError):
			pfusx.dna_to_rvd('AXACCGTCTTATTTT')

	def test_rvd_to_tal(self):
		"""
		Translate RVD2 to TAL2.
		"""

		# Various input formats.
		stripped = 'NIHDNGNNNN'
		slashes = 'NI/HD/NG/NN/NN'
		spaces = 'NI HD NG NN NN'
		dashes = 'NI-HD-NG-NN-NN'
		commas = 'NI,HD,NG,NN,NN'
		space_commas = 'NI, HD, NG, NN, NN'

		# Uniform output.
		expected = 'ACTGG'

		self.assertEqual(pfusx.rvd_to_tal(stripped), expected)
		self.assertEqual(pfusx.rvd_to_tal(slashes), expected)
		self.assertEqual(pfusx.rvd_to_tal(spaces), expected)
		self.assertEqual(pfusx.rvd_to_tal(dashes), expected)
		self.assertEqual(pfusx.rvd_to_tal(commas), expected)
		self.assertEqual(pfusx.rvd_to_tal(space_commas), expected)

	def test_rvd_invalid_input(self):
		"""
		Don't accept invalid RVD sequences.
		"""
		with self.assertRaises(ValueError):
			pfusx.rvd_to_tal("This is not valid input.")
		with self.assertRaises(ValueError):
			pfusx.rvd_to_tal("atatatagatataga")  # DNA and not RVD

	def test_tal_sequence(self):
		""" 
		Segment TAL sequence.
		"""
		result = pfusx.tal_to_codons('ATACCRTCTTATTT')
		expected = ['ATA', 'CCR', 'TCT', 'TAT', 'TTT']
		self.assertEqual(result, expected)

	def test_tal_sequence_sixteen(self):
		"""
		Segment 16-character TAL sequence.
		"""
		result = pfusx.tal_to_codons('ATACCRTCTTATTTA')
		expected = ['ATA', 'CCR', 'TCT', 'TAT', 'TTTA']
		self.assertEqual(result, expected)

	def test_fusx_query(self):
		"""
		Query FusX database to find the well positions of necessary plasmids.
		"""
		# Example from the FusX PHP script at <http://talendesign.org>.
		rvd = pfusx.rvd_to_tal('NI NG NI HD HD NN NG HD NG NG NI NG NG NG NG')
		sequences = pfusx.tal_to_codons(rvd)
		result = pfusx.get_transfers(sequences)
		expected = [
			('pFX1', 'E2'), ('pFX2', 'G3'), ('pFX3', 'H7'), ('pFX4', 'D7'),
			('pB2/B3', 'H12')
		]
		self.assertEqual(result, expected)
