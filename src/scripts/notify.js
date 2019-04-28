const nodemailer = require('nodemailer');
const { Subscription } = require('../models');

const { EMAIL_CONFIG, SITE_URL } = require('../config');

const renderTemplate = ({title, subtitle, content, viewLink, unsubLink}) => {
    return `
        <html>
            <body style="background: #eee;">
                <div style="max-width: 500px;background: white;font-family: sans-serif;margin: 0 auto;overflow: hidden;border-radius: 5px;text-align: justify;">
                    <p style="margin: 20px;font-size: 18px;font-weight: 300;color: #666;line-height: 1.5;">
                        <b>${title}</b><br/>
                        ${subtitle}<br/><br/>
                        ${content}
                    </p>
                    <div style="margin:20px;text-align: center;">
                        <a href="${viewLink}" style="text-decoration: none;display: inline-block;background: #3D87F5;color: white;padding: 10px 20px;border-radius: 5px;" rel="noopener noreferrer">Ver asignatura</a>
                        <br/><br/>
                        <a href="${unsubLink}" style="font-size:14px">Eliminar suscripción</a>
                    </div>
                </div>
            </body>
        </html>
    `;
}

const renderNew = (section, subId) => {
    return renderTemplate({
        title: 'Nueva sección',
        subtitle: 'Una nueva sección ha sido agregada para una asignatura a la que se ha suscrito.',
        unsubLink: SITE_URL + 'unsubscribe/' + subId,
        viewLink: SITE_URL + section.code,
        content: `
                <b>Código:</b> ${section.code}<br/>
                <b>Nombre:</b> <br/>${section.name}<br/>
                <b>Sección:</b> ${section.section}<br/>
                <b>Curso:</b> ${section.room}<br/>
                <b>Horario:</b> <br/>
                <span style="padding-left:10px;">Lun</span>: ${section.schedule[0]}<br/>
                <span style="padding-left:10px;">Mar</span>: ${section.schedule[1]}<br/>
                <span style="padding-left:10px;">Mie</span>: ${section.schedule[2]}<br/>
                <span style="padding-left:10px;">Jue</span>: ${section.schedule[3]}<br/>
                <span style="padding-left:10px;">Vie</span>: ${section.schedule[4]}<br/>
                <span style="padding-left:10px;">Sab</span>: ${section.schedule[5]}   
        `
    });
}

const renderDeleted = (section, subId) => {
    return renderTemplate({
        title: 'Sección eliminada',
        subtitle: 'Una sección ha sido eliminada para una asignatura a la que se ha suscrito.',
        unsubLink: SITE_URL + 'unsubscribe/' + subId,
        viewLink: SITE_URL + section.code,
        content: `
                <b>Código:</b> ${section.code}<br/>
                <b>Nombre:</b> <br/>${section.name}<br/>
                <b>Sección:</b> ${section.section}<br/>
                <b>Curso:</b> ${section.room}<br/>
                <b>Horario:</b> <br/>
                <span style="padding-left:10px;">Lun</span>: ${section.schedule[0]}<br/>
                <span style="padding-left:10px;">Mar</span>: ${section.schedule[1]}<br/>
                <span style="padding-left:10px;">Mie</span>: ${section.schedule[2]}<br/>
                <span style="padding-left:10px;">Jue</span>: ${section.schedule[3]}<br/>
                <span style="padding-left:10px;">Vie</span>: ${section.schedule[4]}<br/>
                <span style="padding-left:10px;">Sab</span>: ${section.schedule[5]}            
        `
    });
}

const fieldNames = {
    professor: 'Profesor',
    room: 'Curso',
    schedule: 'Horario',
    name: 'Nombre',
    credits: 'Créditos'
}

const renderChange = (change, subId) => {
    return renderTemplate({
        title: 'Sección actualizada',
        subtitle: 'Una sección ha sido actualizada para una asignatura a la que se ha suscrito.',
        unsubLink: SITE_URL + 'unsubscribe/' + subId,
        viewLink: SITE_URL + change.code,
        content: `
            <b>Código:</b> ${change.code}<br/>
            <b>Sección:</b> ${change.section}<br/>
            <b>Cambio:</b> ${fieldNames[change.field]}<br/>
            <b>Antes:</b> ${change.oldValue}<br/>
            <b>Después:</b> ${change.newValue}
        `
    });
}

const GET_TEMPLATE = {
    UPDATE: renderChange,
    CREATE: renderNew,
    DELETE: renderDeleted
}

const findSubscriptions = async (code, type) => {
    return await Subscription.find({code, types: type}).lean().exec();
}

const generateSubject = (change) => `[${change.code}] Notificación de Cambio`;

const sendEmail = async (transporter, to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            subject, to, html
          });
        
        console.log("Message sent: %s", info.messageId);
    } catch(err) {
        console.error('Error sending mail', err);
    }
}

const notifyChanges = async (diff) => {
    let newSections = diff.new.map(x => {return {...x, type: 'CREATE'}});
    let deletedSections = diff.deleted.map(x => { return {...x, type: 'DELETE'}});
    let changedSections = diff.changes.map(x => {return {...x, type: 'UPDATE'}});

    let offerChanges = [...newSections, ...deletedSections, ...changedSections];
    console.log(offerChanges);

    let transporter = nodemailer.createTransport(EMAIL_CONFIG);

    let mails = [];
    for(let change of offerChanges) {
        let actualType = change.type;
        if(change.type == 'UPDATE') {
            actualType = 'UPDATE_' + change.field;
        }

        const subscriptions = await findSubscriptions(change.code, actualType);
        for (const subscription of subscriptions) {
            mails.push(sendEmail(transporter, subscription.email, generateSubject(change), 
                GET_TEMPLATE[change.type](change, subscription._id)));
        }
    }

    await Promise.all(mails);
    transporter.close();
};

module.exports = notifyChanges;