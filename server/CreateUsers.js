import { Mongo } from 'meteor/mongo';

const USERS = 1000000;
const GROUPS = 1000;

// Meteor.startup(() => {
  const UsersTest = new Mongo.Collection('usersTest');
  UsersTest._ensureIndex({ 'emails.address': 1}, { unique: true, sparse: true });
  // UsersTest._deleteMany({});

  if(false) { // switch to true here to add users to DB

    const groups = []
    let toInsert = []
    let inserted = 0
    function insert() {
      inserted += toInsert.length
      toInsert?.forEach(d =>  UsersTest.insert(d))
      console.log(`inserted ${inserted}`)
      toInsert = []
    }
    for(let i = 0; i < USERS; i++) {
      console.log(i)
      const groupIndex = i % GROUPS
      groups[groupIndex] = groups[groupIndex] || generateText(4)
      const group = groups[groupIndex]
      const email = `${group}-${generateText(10)}@domain.com`
      toInsert.push({
        emails: [{ address: email }]
      })

      if (i % 10000 === 0) {
        insert()
      }
    }

    insert()

    function generateText(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      while (result.length < length) {
        const index = Math.floor(Math.random() * characters.length);
        result += characters.charAt(index);
      }

      return result;
    }
  }
// })

export default UsersTest
