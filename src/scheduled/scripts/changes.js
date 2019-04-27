const mongoose = require('mongoose');

const { MONGO_URL } = require('../../config');
const { Section, Change } = require('../../models');

const getDiscriminator = (code, section) => `${code}-${section}`;

const registerChanges = async (diff) => {
    let newSections = diff.new.map(x => {return {type: 'CREATE', code: x.code, section: x.section}});
    let deletedSections = diff.deleted.map(x => { return {type: 'DELETE', code: x.code, section: x.section}});
    let changedSections = Object.values(diff.changes).map(x => {return {type: 'UPDATE', ...x}});

    let offerChanges = [...newSections, ...deletedSections, ...changedSections];
    if(offerChanges.length > 0) {
        await Change.insertMany(offerChanges);
    } 
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
    
    mongoose.connect(MONGO_URL, {useNewUrlParser: true});
    mongoose.connection.on('connected', () => {
        console.log('Connected to database');
    });
    
    let dbSections = await Section.find().exec();
    
    let offerChanges = {};
    let updatedSections = [];
    let deletedSections = [];

    for(let dbSection of dbSections) {
        let discrim = getDiscriminator(dbSection.code, dbSection.section);

        if (discrim in sections) {
            let section = sections[discrim];

            const track_fields = ['professor', 'room', 'credits', 'schedule', 'name'];

            for(let field of track_fields) {
                let oldValue = dbSection[field];
                let newValue = section[field];

                // Convert to string to make diff check easier
                if(Array.isArray(newValue)) {
                    oldValue = oldValue.join(', ');
                    newValue = newValue.join(', ');
                }

                if(oldValue !== newValue) {
                    if(!(discrim in offerChanges)) {
                        offerChanges[discrim] = [];
                    }

                    offerChanges[discrim].push({
                        code: section.code, 
                        section: section.section, 
                        field, newValue, oldValue
                    });
                }
            }

            if(discrim in offerChanges) {
                await Section.findOneAndUpdate({code: section.code, section: section.section}, section).exec();
            }

            updatedSections.push(discrim);
        } else {
            deletedSections.push(dbSection);
            await Section.deleteOne({_id: dbSection._id}).exec();
        }
    }

    // New sections
    const newSections = Object.keys(sections).filter(x => !updatedSections.includes(x));
    for(let newSection of newSections) {
        await new Section(sections[newSection]).save();
    }

    const offerDiff = {
        new: newSections.map(x => sections[x]),
        changes: offerChanges,
        deleted: deletedSections
    }

    await registerChanges(offerDiff);

    mongoose.connection.close();

    return offerDiff;
};

module.exports = computeChanges;