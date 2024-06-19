#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import {CreateProject, Questions} from './funcs/CreateProject.js';

const program = new Command();

program.name('hamilton').version('0.0.1').description('Hamilton CLI');

program.command('new')
.description('Create a new project')
.argument('<name>', 'project name')
.option('--first', 'first name')
.action((out, options) => {
    if(options.first) {
        CreateProject(out, true);
    } else {
        Questions();
    }
});

program.parse();