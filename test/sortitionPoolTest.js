const Branch = artifacts.require('Branch')
const Position = artifacts.require('Position')
const StackLib = artifacts.require('StackLib')
const Trunk = artifacts.require('Trunk')
const Leaf = artifacts.require('Leaf')
const SortitionPool = artifacts.require('./contracts/SortitionPool.sol')

contract('SortitionPool', (accounts) => {
  const seed = '0xff39d6cca87853892d2854566e883008bc'
  let pool

  beforeEach(async () => {
    SortitionPool.link(Branch)
    SortitionPool.link(Position)
    SortitionPool.link(StackLib)
    SortitionPool.link(Trunk)
    SortitionPool.link(Leaf)
    pool = await SortitionPool.new()
  })

  describe('selectGroup', async () => {
    it('returns group of expected size', async () => {
      await pool.insertOperator(accounts[0], 10)
      await pool.insertOperator(accounts[1], 11)
      await pool.insertOperator(accounts[2], 12)

      const group = await pool.selectGroup(3, seed)
      assert.equal(group.length, 3)
    })

    it('reverts when there are no operators in pool', async () => {
      try {
        await pool.selectGroup(3, seed)
      } catch (error) {
        assert.include(error.message, 'No operators in pool')
        return
      }

      assert.fail('Expected throw not received')
    })

    it('returns group of expected size if less operators are registered', async () => {
      await pool.insertOperator(accounts[0], 1)

      const group = await pool.selectGroup(5, seed)
      assert.equal(group.length, 5)
    })
  })

  describe('selectSetGroup', async () => {
    it('returns group of expected size with unique members', async () => {
      await pool.insertOperator(accounts[0], 10)
      await pool.insertOperator(accounts[1], 11)
      await pool.insertOperator(accounts[2], 12)
      await pool.insertOperator(accounts[3], 5)
      await pool.insertOperator(accounts[4], 1)

      let group = await pool.selectSetGroup(3, seed)
      assert.equal(group.length, 3)
      assert.isFalse(hasDuplicates(group))

      group = await pool.selectSetGroup(5, seed)
      assert.equal(group.length, 5)
      assert.isFalse(hasDuplicates(group))
    })

    function hasDuplicates(array) {
      return (new Set(array)).size !== array.length
    }

    it('reverts when there are no operators in pool', async () => {
      try {
        await pool.selectSetGroup(3, seed)
      } catch (error) {
        assert.include(error.message, 'Not enough operators in pool')
        return
      }

      assert.fail('Expected throw not received')
    })

    it('reverts when there are not enough operators in pool', async () => {
      await pool.insertOperator(accounts[0], 10)
      await pool.insertOperator(accounts[1], 11)

      try {
        await pool.selectSetGroup(3, seed)
      } catch (error) {
        assert.include(error.message, 'Not enough operators in pool')
        return
      }

      assert.fail('Expected throw not received')
    })
  })
})
