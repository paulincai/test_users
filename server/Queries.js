import UsersTest from './CreateUsers'

const emails = async () => {
  return UsersTest.rawCollection().aggregate([{ $sample: { size: 10 } }]).toArray()
}

// create unique emails
emails().then(
  r => {
    console.log({ r })
    r.map(doc => doc.emails?.[0].address).map(email => email).forEach(email => {
      console.log('Searching: ', email)

      if (true) { // switch here to use one or the other
        let query = selectorForFastCaseInsensitiveLookup('emails.address', email)
        timeQuery('Selector For Fast Case Insensitive Lookup', query)
      } else {
        let query = {
          'emails.address': { $regex: email, $options: 'i' }
        }
        timeQuery('Case Insensitive Regexp', query)
      }
    })
  }
)

const timeQuery = (type, query) => {
  let start = Date.now();
  // console.log({ query})

  const r = UsersTest.find(query, { limit: 2 })?.fetch();
  console.log('found: ', r?.[0]?.emails?.[0]?.address)
  let end = Date.now();
  console.log(`Spent ${end - start}ms for ${type}`);
}

function _escapeRegExp (string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

function selectorForFastCaseInsensitiveLookup (fieldName, string) {
  // Performance seems to improve up to 4 prefix characters
  const prefix = string.substring(0, Math.min(string.length, 4));
  const orClause = generateCasePermutationsForString(prefix).map(
    prefixPermutation => {
      const selector = {};
      selector[fieldName] =
        new RegExp(`^${_escapeRegExp(prefixPermutation)}`);
      return selector;
    });
  const caseInsensitiveClause = {};
  caseInsensitiveClause[fieldName] =
    new RegExp(`^${_escapeRegExp(string)}$`, 'i')
  return { $and: [{ $or: orClause }, caseInsensitiveClause] };
}

function generateCasePermutationsForString (string) {
  let permutations = [''];
  for (let i = 0; i < string.length; i++) {
    const ch = string.charAt(i);
    permutations = [].concat(...(permutations.map(prefix => {
      const lowerCaseChar = ch.toLowerCase();
      const upperCaseChar = ch.toUpperCase();
      // Don't add unneccesary permutations when ch is not a letter
      if (lowerCaseChar === upperCaseChar) {
        return [prefix + ch];
      } else {
        return [prefix + lowerCaseChar, prefix + upperCaseChar];
      }
    })));
  }
  return permutations;
}
