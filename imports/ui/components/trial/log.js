/**
 * imports/ui/components/trial/log.js
 *
 * Purpose:
 *  - Reports runtime engine events & outcomes
 * */

export function createLog(instance) {
    const print = (label, color, description) => console.log(`%c ${ label }${ description }%c @${ performance.now() } `,
            `background: ${ color }; color: white; padding: 0.35em;`,
            `background: #111; color: ${ color }; padding: 0.25em; border: 1px solid ${ color }; font-weight: 800;`),
        printEvent = (color, description) => print('', color, description),
        printTimer = (trial, stage, name, color, description) => {
            const t = instance.TM?.timers?.[ trial ]?.[ stage ]?.[ name ];

            if (t !== null) {
                print(`⌛ Timer ${ t } (${ name }) `, color, description);
            } else {
                console.warn('Missing timer for log:', { trial, stage, name });
            }
        },
        recordTimer = (type, action, desc, n = false, log = 'timers', timeStamp = performance.now()) => {
            const colors = { mqtt: 'orange', timers: 'rebeccapurple' },
                event = action ? `${ type }.${ action }` : type,
                name = (Number.isFinite(n) && n >= 0) ? `${ type }.${ n }.${ action }` : type;

            instance.io.trial.record({ timeStamp, type: `${ event }` });

            if (!instance.logging?.[ log ]) return;

            printTimer(instance.n.get() + 1, instance.stage.get(), name, colors[ log ], desc);
        };

    return { printEvent, printTimer, recordTimer };
}
