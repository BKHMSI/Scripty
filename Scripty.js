/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.34fc2b19-fa4f-420e-8884-066ab1f3dfef';  // TODO replace with your app ID (OPTIONAL).

function rand(r) {
    return Math.floor(Math.random() * 10000) % r;
}

const languageStrings = {
    'en-US': {
        translation: {
            START_MESSAGE: [
                "Welcome Young Genius, I'm gonna teach u today how to code ! It should be fun"
            ],
            STOP_MESSAGE: [
                "Farewell, Young Genius!"
            ],
            HELP_MESSAGE: [
                "Do u want to know more about scripty ?",
                "Code scripty is an interactive voice-based programming educator platform .. It teaches kids simple programming operations."
            ],
            RE_PROMPTS: [
                "Go on!",
                "Let's get going!",
                "Rock on!",
                "Let's code!"
            ],
            SKILL_NAME: "Code Scripty",
            REPEAT_STMT_PROMPTS: [
                "What shall I repeat?",
                "I will repeat all that you say next. Say \"end repeat\" when you're done."
            ],
            Condition_FALSE: [
                ""
            ],
            CHALLENGES: [
                'Make your cat meow then your dog bark two times. Hint: you can say play cat',
                'Let\'s see what will happen if you say work more than three times',
                'Try to multiply all the numbers up to five'
            ]
        }
    }
};

function vars(ctxt) {
    if (!('vars' in ctxt.event.session.attributes))
        ctxt.event.session.attributes['vars'] = {};
    return ctxt.event.session.attributes.vars;
}

function slots(ctxt) {
    return ctxt.event.request.intent.slots;
}

function sv(ctxt, v) {
    return ctxt.event.request.intent.slots[v].value;
}

function remember(ctxt, stmt) {
    ctxt.event.session.attributes["repeat"].push(stmt);
}

function isRepeat(ctxt) {
    return ("repeat_limit" in ctxt.event.session.attributes && ctxt.event.session.attributes["repeat_limit"] !== 0);
}

/*
stmt: {
    op: <op>,
    vars: {
        a: <'number'|'var_name'>,
        b: <'number'|'var_name'>,
        d: 'var_name'
    }
}
*/

function isNum(str) {
    return !isNaN(str);
}

function do_arith(t, op, a, b, d) {
    function get(v) {
        if (isNum(v))
            return parseInt(v);
        else
            return vars(t)[v];
    }

    if (!(d in vars(t)))
        vars(t)[d] = 0;

    var a_ = get(a);
    var b_ = get(b);

    switch (op) {
        case '+': {
            vars(t)[d] = a_ + b_;
        } break;

        case '-': {
            vars(t)[d] = a_ - b_;
        } break;

        case '*': {
            vars(t)[d] = a_ * b_;
        } break;

        case '/': {
            vars(t)[d] = a_ / b_;
        } break;

        case '%': {
            vars(t)[d] = a_ % b_;
        } break;

        default:
            break;
    }
}

const handlers = {
    // Y @= h;
    'add': function () {
        var a, d;
        var e = this.event;
        if ('value' in slots(this)['num'])
            a = sv(this, 'num');
        else if ('value' in slots(this)['var'])
            a = sv(this, 'var');

        d = sv(this, "dest");
        var notif = "";

        if (isRepeat(this)) {
            let obj = { '+': { 'a': d, 'b': a, 'd': d } };
            remember(this, obj);
        }
        else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]){
            do_arith(this, '+', a, d, d);
            notif = "Added " + a + " to " + d + '. ' + d + ' is now ' + vars(this)[d] + '.';
        }
        
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif));
    },
    'subtract': function () {
        var a, d;
        var e = this.event;
        if ('value' in slots(this)['num'])
            a = sv(this, 'num');
        else if ('value' in slots(this)['var'])
            a = sv(this, 'var');

        // [d] -= a
        d = sv(this, "dest");
        var notif = " ";
        if (isRepeat(this)) {
            let obj = { '-': { 'a': d, 'b': a, 'd': d } };
            remember(this, obj);
        }
        else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]){
            do_arith(this, '-', a, d, d);
            notif = "Subtracted " + a + " from " + d + '. ' + d + ' is now ' + vars(this)[d] + '.';
        }

        const re_prompt = this.t('RE_PROMPTS')[rand(4)]
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif));
    },
    'multiply': function () {
        var a, d;
        var e = this.event;
        if ('value' in slots(this)['num'])
            a = sv(this, 'num');
        else if ('value' in slots(this)['var'])
            a = sv(this, 'var');

        d = sv(this, "dest");  
        var notif = " ";
        if (isRepeat(this)) {
            let obj = {
                '*': {
                    'a': d,
                    'b': a,
                    'd': d
                }
            };
            remember(this, obj);
        }
        else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]) {
            // [d] *= a
            do_arith(this, '*', a, d, d);
            notif = "Multiplied " + a + " by " + d + '. ' + d + ' is now ' + vars(this)[d] + '.';
        }

        var re_prompt = this.t('RE_PROMPTS')[rand(4)]

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif));
    },
    'divide': function () {
        var a, d;
        var e = this.event;
        if ('value' in slots(this)['num'])
            a = sv(this, 'num');
        else if ('value' in slots(this)['var'])
            a = sv(this, 'var');

        // [d] /= a
        d = sv(this, "dest");
        var notif = " ";
        if (isRepeat(this)) {
            let obj = { '/': { 'a': d, 'b': a, 'd': d } };
            remember(this, obj);
        }
        else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]){
            do_arith(this, '/', a, d, d);
            notif = "Divided " + a + " by " + d + '. ' + d + ' is now ' + vars(this)[d] + '.';
        }

        var re_prompt = this.t('RE_PROMPTS')[rand(4)]

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif));
    },
    'assign': function () {
        var src, d;
        var e = this.event;
        if ('value' in slots(this)['num'])
            src = sv(this, 'num');
        else
            src = sv(this, 'var');

        d = sv(this, 'dest');
        var notif = " ";
        if (isRepeat(this)) {
            let obj = { '+': { 'a': src, 'b': '0', 'd': d } }
            remember(this, obj);
        }
       else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]){
            do_arith(this, '+', src, '0', d);
            notif = 'Done. ' + d + ' now has ' + vars(this)[d] + '.';
       }

        var re_prompt = this.t('RE_PROMPTS')[rand(4)]

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    //
    'assign_operation': function () {
        function get_op(op) {
            switch (op) {
                case 'plus':
                case 'added to':
                    {
                        return '+';
                    } break;

                case 'minus':
                    {
                        return '-';
                    } break;

                case 'times':
                case 'multiplied by':
                    {
                        return '*';
                    } break;

                case 'over':
                case 'divided by':
                    {
                        return '/';
                    } break;

                case 'modulus':
                case 'mod':
                    {
                        return '%';
                    } break;
            }
        }

        var a, b;
        var e = this.event;
        var notif = " ";
        if ('value' in slots(this)['num_a'])
            a = sv(this, 'num_a');
        else if ('value' in slots(this)['var_a'])
            a = sv(this, 'var_a');

        if ('value' in slots(this)['num_b'])
            b = sv(this, 'num_b');
        else if ('value' in slots(this)['var_b'])
            b = sv(this, 'var_b');

        const d = sv(this, 'dest');

        const op = get_op(sv(this, 'op'));

        if (isRepeat(this)) {
            let obj = {};
            obj[op] = { 'a': a, 'b': b, 'd': d };
            remember(this, obj);
        }
        else if(!e.session.attributes["selection"] || e.session.attributes["comparison"]){
            do_arith(this, op, a, b, d);
            // "d now has (a @ b) which equals [d]."
            notif = d + ' now has ' + a + ' ' + sv(this, 'op') + ' ' + b + ' which equals ' + vars(this)[d] + '.';
        }

        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'startrepeat': function () {
        let limit = sv(this, 'limit');
        var e = this.event;

        e.session.attributes["repeat_limit"] = limit;
        e.session.attributes["repeat"] = [];
        e.session.attributes["selection"] = 0;
        e.session.attributes["comparsion"] = 1;
        const notif = this.t('REPEAT_STMT_PROMPTS')[rand(2)];
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'endrepeat': function () {
        // Execute Loop Body
        var e = this.event;

        var arr = e.session.attributes["repeat"];
        let limit = parseInt(e.session.attributes["repeat_limit"]);
        var out = " ";
        var work_counter = 0;
        let work_file = "<audio src=\"https://s3-eu-west-1.amazonaws.com/testingaudio/work.mp3\"></audio>";
        while (limit--) {
            var a, b, d, src, op, key;
            for (var j = 0; j < arr.length; j++) {
                key = Object.keys(arr[j])[0];
                switch (key) {
                    case "+":
                    case "-":
                    case "*":
                    case "/": {
                        a = arr[j][key]['a'];
                        b = arr[j][key]['b'];
                        d = arr[j][key]['d'];
                        do_arith(this, key, a, b, d);
                    } break;
                    case "say": {
                        op = arr[j]['say']['out'];
                        if(op.indexOf("work") != -1) work_counter++;
                        if(work_counter == 4)
                            out += work_file;
                        else if(work_counter <4)
                            out +=  (op+", ");
                    } break;
                    case "play": {
                        op = arr[j]['play']['file'];
                        out += op;
                    } break;
                }
            }
        }
        
        
        const notif = 'Ok, I will run the loop.';
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        e.session.attributes["repeat"] = [];
        e.session.attributes["repeat_limit"] = 0;

        this.emit(":askWithCard"
            , (out)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );

        // this.emit(":askWithCard"
        //             , (notif)
        //             , (re_prompt)
        //             , (this.t('SKILL_NAME'))
        //             , (notif)
        //             );
    },
    'condition_eq': function () {
        // Execute Loop Body
        var e = this.event;
        var a, b;

        if ('value' in slots(this)['num_a'])
            a = sv(this, 'num_a');
        else if ('value' in slots(this)['var_a'])
            a = sv(this, 'var_a');

        if ('value' in slots(this)['num_b'])
            b = sv(this, 'num_b');
        else if ('value' in slots(this)['var_b'])
            b = sv(this, 'var_b');

        do_arith(this, '-', a, b, 'temporary_impossible_variable');

        e.session.attributes["comparison"] = vars(this)['temporary_impossible_variable'] === 0;
        e.session.attributes["selection"] = 1; 

        const notif = 'Ok, comparing '+a+" to "+b;
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'condition_ne': function () {
        // Execute Loop Body
        var e = this.event;
        var a, b;

        if ('value' in slots(this)['num_a'])
            a = sv(this, 'num_a');
        else if ('value' in slots(this)['var_a'])
            a = sv(this, 'var_a');

        if ('value' in slots(this)['num_b'])
            b = sv(this, 'num_b');
        else if ('value' in slots(this)['var_b'])
            b = sv(this, 'var_b');

        do_arith(this, '-', a, b, 'temporary_impossible_variable');

        e.session.attributes["comparison"] = vars(this)['temporary_impossible_variable'] !== 0;
        e.session.attributes["selection"] = 1;

        const notif = 'Ok, comparing '+a+" to "+b;
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'condition_lt': function () {
        // Execute Loop Body
        var e = this.event;
        var a, b;

        if ('value' in slots(this)['num_a'])
            a = sv(this, 'num_a');
        else if ('value' in slots(this)['var_a'])
            a = sv(this, 'var_a');

        if ('value' in slots(this)['num_b'])
            b = sv(this, 'num_b');
        else if ('value' in slots(this)['var_b'])
            b = sv(this, 'var_b');

        do_arith(this, '-', a, b, 'temporary_impossible_variable');

        e.session.attributes["comparison"] = vars(this)['temporary_impossible_variable'] < 0;
        e.session.attributes["selection"] = 1;
         
        const notif = 'Ok, comparing '+a+" to "+b;
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'condition_gt': function () {
        // Execute Loop Body
        var e = this.event;
        var a, b;

        if ('value' in slots(this)['num_a'])
            a = sv(this, 'num_a');
        else if ('value' in slots(this)['var_a'])
            a = sv(this, 'var_a');

        if ('value' in slots(this)['num_b'])
            b = sv(this, 'num_b');
        else if ('value' in slots(this)['var_b'])
            b = sv(this, 'var_b');

        do_arith(this, '-', a, b, 'temporary_impossible_variable');

        e.session.attributes["comparison"] = vars(this)['temporary_impossible_variable'] > 0;
        e.session.attributes["selection"] = 1;
         
        const notif = 'Ok, comparing '+a+" to "+b;
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'endif': function(){
        var e = this.event;
        var notif = "";
        e.session.attributes["selection"] = 0;
        if(!e.session.attributes["comparison"])
            notif = 'Condition was false, so I will not run the code';

        const re_prompt = this.t('RE_PROMPTS')[rand(4)];

        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'say': function () {
        var notif = sv(this, "output");
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        let e = this.event;
        if (isRepeat(this)) {
            let obj = { 'say': { 'out': notif } };
            remember(this, obj);
            notif = " ";
        }
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'play_audio': function(){
        const sound = sv(this, "animal");
        var file = "";
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        let e = this.event;
        switch(sound){
            case "cat":
                file = '<audio src="https://s3-eu-west-1.amazonaws.com/testingaudio/meow.mp3"></audio>';
                break;
            case "dog":
                file = "<audio src=\"https://s3-eu-west-1.amazonaws.com/testingaudio/woof.mp3\"></audio>";
                break;
            case "cow":
                file = "<audio src=\"https://s3-eu-west-1.amazonaws.com/testingaudio/meow.mp3\"></audio>";
                break;
            case "work":
                file = "<audio src=\"https://s3-eu-west-1.amazonaws.com/testingaudio/work.mp3\"></audio>";
                break;
            default:
                file = "<audio src=\"https://s3-eu-west-1.amazonaws.com/testingaudio/meow.mp3\"></audio>";
        }
        
        if (isRepeat(this)) {
            let obj = { 'play': { 'sound': sound, 'file': file } };
            remember(this, obj);
            file = " ";
        }
        
        this.emit(":askWithCard"
            , (file)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , ("Playing "+ sound)
        );
    },
    'finish': function(){
        this.emit(":tell", this.t("STOP_MESSAGE"));
    },
    'print': function(){
        let e = this.event;
        const variable = sv(this, "var");
        const val = ( variable in e.session.attributes["vars"] ) ? e.session.attributes["vars"][variable]:"undefined";
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        let notif = variable+ " is "+ val; 
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'challenge': function(){
        let e = this.event;
        const notif = this.t('CHALLENGES')[rand(3)];       
        const re_prompt = this.t('RE_PROMPTS')[rand(4)];
        this.emit(":askWithCard"
            , (notif)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (notif)
        );
    },
    'LaunchRequest': function () {
        this.event.session.attributes['vars'] = {};
        
        const welcome_msg = this.t('START_MESSAGE')[rand(1)];
        const re_prompt = this.t('RE_PROMPTS')[rand(1)];

        this.emit(':askWithCard'
            , (welcome_msg)
            , (re_prompt)
            , (this.t('SKILL_NAME'))
            , (welcome_msg + "\nImpress yourself.")
        );
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE')[0];
        const reprompt = this.t('HELP_MESSAGE')[1];
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'unhandled': function() {
        this.emit(':ask', 'I did not understand this. Sorry.');
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};