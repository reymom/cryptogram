export const updateObject = ( oldObject, updatedProperties ) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
};

export const updateVisitedCreations = ( oldObject, artworkIdToUpdate ) => {

    let noUpdateArtworks = oldObject.newCreations.filter(
        artwork => artwork.index !== artworkIdToUpdate
    );
    let artworkToUpdate = oldObject.newCreations.filter(
        artwork => artwork.index === artworkIdToUpdate
    )[0];

    return {
        ...oldObject,
        newCreations: [
            ...noUpdateArtworks,
            {
                ...artworkToUpdate,
                visited: true
            }
        ]
    };
}

export const updateVisitedPurchases = ( oldObject, artworkIdToUpdate ) => {

    let noUpdateArtworks = oldObject.newPurchases.filter(
        artwork => artwork.index !== artworkIdToUpdate
    );
    let artworkToUpdate = oldObject.newPurchases.filter(
        artwork => artwork.index === artworkIdToUpdate
    )[0];

    return {
        ...oldObject,
        newPurchases: [
            ...noUpdateArtworks,
            {
                ...artworkToUpdate,
                visited: true
            }
        ]
    };
}

export const checkValidity = (value, rules) => {
    let isValid = true;
    if (!rules) { return true; }
    if (rules.required) { isValid = value.trim() !== '' && isValid; }
    if (rules.minLength) { isValid = value.length >= rules.minLength && isValid; }
    if (rules.maxLength) { isValid = value.length <= rules.maxLength && isValid; }
    if (rules.isEmail) {
        const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        isValid = pattern.test( value ) && isValid;
    }
    if (rules.isAddress) {
        isValid = value.slice(0, 2) === '0x' && value.length === 42 && isValid
    }
    if (rules.isFloat) {
        const floatPattern = /^\d*(\.\d+)?$/;
        isValid = floatPattern.test(value) && isValid
    }
    if (rules.isInteger) {
        const integerPattern = /^\d+$/;
        isValid = integerPattern.test(value) && isValid
    }
    if (rules.minNum) { isValid = value >= rules.minNum && isValid }
    if (rules.maxNum) { isValid = value <= rules.maxNum && isValid }
    if (rules.matchPassword) { isValid = value[0] === value[1] && isValid }
    if (rules.isSeed) {
        isValid = value.trim().split(/\s+/g).length >= 12 && isValid;
    }
    return isValid;
}