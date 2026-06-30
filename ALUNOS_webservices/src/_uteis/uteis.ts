/**
 * Generates a random string derived from a given seed and a specified length.
 * The output string is composed of characters from a predefined set and
 * includes random characters to ensure uniqueness and randomness.
 *
 * @param {string} seed - The seed string that provides the base for generating the random string.
 * @param {number} [length=16] - The length of the output string. If less than the seed length,
 *                               the output will be at least as long as the seed.
 * @returns {string} A randomized string of the specified length, consisting of alphanumeric characters.
 *
 * @example
 * // Returns a random string of length 16 based on the seed "MyOrg125202410".
 * const randomStr = generateRandomString("MyOrg125202410");
 */
export function generateRandomString(seed: string, length: number = 16): string {
    const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    length = Math.max(length, seed.length);

    const randomChars: string = Array.from({ length: length - seed.length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    const combined: string = seed + randomChars;
    const shuffled: string = combined.split('').sort(() => 0.5 - Math.random()).join('');
    const startPoint: number = Math.floor(Math.random() * (shuffled.length - length + 1));

    return shuffled.slice(startPoint, startPoint + length);
}

export function toCapitalizedCase(str: string): string {
    return str
            .toLowerCase()
            .split(' ')
            .map(word => `${word.substring(0, 1).toUpperCase()}${word.substring(1, word.length)}`)
            .join(' ')
}

export function getShortName(str: string): string {
    if(!str){
        throw new Error("Invalid string provided");
    }

    const names = str.trim().split(" ").map(entry => toCapitalizedCase(entry));

    if(names.length === 1){
        return toCapitalizedCase(names[0]);
    }

    return `${toCapitalizedCase(names[0])} ${toCapitalizedCase(names[names.length - 1])}`;
}

/**
 * Generates a letter combination similar to Excel columns (e.g., A, AA, ZZZ),
 * based on a given 1-based number and a specified length.
 *
 * For example, with length 3:
 * - 1   => 'AAA'
 * - 2   => 'AAB'
 * - 27  => 'ABA'
 * - 17576 => 'ZZZ'
 *
 * @param {number} number - The 1-based number to convert to a letter combination.
 * @param {number} length - The number of letters in the resulting combination (e.g., 2 for 'AA', 3 for 'AAA').
 * @returns {string} The resulting letter combination (uppercase only).
 * @throws {Error} If the number is less than 1 or exceeds the maximum combinations for the given length (26^length).
 */
export function generateLettersCombinationFromNumber(number: number, length: number): string {
    //Base 26 corresponds to the 26 letter alphabet
    const base = 26;

    const maxCombinationsAllowed = Math.pow(base, length);
    if (number < 1 || number > maxCombinationsAllowed) {
        throw new Error(`Number out of range (must be between 1 and ${maxCombinationsAllowed})`);
    }

    number -= 1;
    let result = '';

    for (let i = 0; i < length; i++) {
        result = String.fromCharCode(65 + (number % base)) + result;
        number = Math.floor(number / base);
    }

    return result;
}

export function validateNif(nif: string) {
    if (!/^\d{9}$/.test(nif)) {
        throw new Error('Provided NIF must be a 9 digits number');
    }

    const validPrefixes = [
        '1', '2', '3',        // individual person
        '45',                // non-resident individual person
        '5',                 // legal entity (company)
        '6',                 // public administration
        '70', '71', '72',    // undivided estate, non-resident legal entity, investment funds
        '77', '79',          // assigned by tax authority, exceptional regime
        '8',                 // sole proprietor (no longer in use)
        '90', '91',          // condominiums/irregular companies
        '98', '99'           // non-residents, civil societies
    ];

    if(!validPrefixes
        .some(p => (p.length === 2 && p === nif.substring(0, 2)) ||
            (p.length === 1 && p === nif.charAt(0)))) {
        throw new Error('Invalid NIF');
    }

    //Generate control digit (11 modulus)
    let total = 0;
    for (let i = 0; i < 8; i++) {
        total += parseInt(nif.charAt(i)) * (9 - i);
    }
    if((((total % 11) === 0 || (total % 11) === 1 ? 0 : 11 - (total % 11)) === parseInt(nif.charAt(8))))
        return true;

    throw new Error('Invalid NIF');
}