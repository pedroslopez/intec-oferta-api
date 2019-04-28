const { Section, Change } = require('../models');

const getDiscriminator = (code, section) => `${code}-${section}`;

const registerChanges = async (diff) => {
    let newSections = diff.new.map(x => {return {type: 'CREATE', code: x.code, section: x.section}});
    let deletedSections = diff.deleted.map(x => { return {type: 'DELETE', code: x.code, section: x.section}});
    let changedSections = diff.changes.map(x => {return {type: 'UPDATE', ...x}});

    let offerChanges = [...newSections, ...deletedSections, ...changedSections];
    if(offerChanges.length > 0) {
        await Change.insertMany(offerChanges);
    } 

    return offerChanges;
}

const computeChanges = async (offer) => {
    const sections = offer.reduce((map, section) => {
        const discrim = getDiscriminator(section.code, section.section);
        if(discrim in map) {
            console.warn(`${discrim} ALREADY EXISTS! WILL REPLACE!`);
        }
        map[discrim] = section;
        return map;
    }, {});
    
    let dbSections = await Section.find().lean().exec();
    
    let changedSections = [];
    let updatedSections = [];
    let deletedSections = [];

    for(let dbSection of dbSections) {
        let discrim = getDiscriminator(dbSection.code, dbSection.section);

        if (discrim in sections) {
            let section = sections[discrim];

            const track_fields = ['professor', 'room', 'credits', 'schedule', 'name'];

            let updated = false;
            for(let field of track_fields) {
                let oldValue = dbSection[field];
                let newValue = section[field];

                // Convert to string to make diff check easier
                if(Array.isArray(newValue)) {
                    oldValue = oldValue.join(', ');
                    newValue = newValue.join(', ');
                }

                if(oldValue !== newValue) {
                    changedSections.push({
                        code: section.code, 
                        section: section.section, 
                        field, newValue, oldValue
                    });
                    updated = true;
                }
            }

            if(updated) {
                console.log('UPDATED SECTION', discrim);
                await Section.findOneAndUpdate({code: section.code, section: section.section}, section).exec();
            }

            updatedSections.push(discrim);
        } else {
            console.log('REMOVED SECTION', discrim);
            deletedSections.push(dbSection);
            await Section.deleteOne({_id: dbSection._id}).exec();
        }
    }

    // New sections
    const newSections = Object.keys(sections).filter(x => !updatedSections.includes(x));
    for(let newSection of newSections) {
        console.log('NEW SECTION', newSection);
        await new Section(sections[newSection]).save();
    }

    const offerDiff = {
        new: newSections.map(x => sections[x]),
        changes: changedSections,
        deleted: deletedSections
    }

    await registerChanges(offerDiff);

    return offerDiff;
};

module.exports = computeChanges;