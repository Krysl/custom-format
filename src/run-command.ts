import execa = require('execa')
import stripColor = require('strip-color')
import { log, logError } from './log'

export async function runCommand(text: string, command: string, filename: string, workspacePath: string): Promise<string> {
	const cmd = command.replace(/\$FILE(?![\w\d_])/g, filename)
	const file = cmd.split(' ').shift()

	if (!file) return text

	const errorOut = (error: any) =>
		logError(
			`Received an error while running the following format command on ${filename}:\n> ${command}\nError:\n> ${error.replace(
				/\n/g,
				'\n> '
			)}`
		)

	const startMs = Date.now()

	try {
		const { stdout, stderr } = await execa( cmd, null, { input: text, cwd: workspacePath })

		if (stderr.length) errorOut(stderr)

		if (stdout.length) {
			log(`Formatted ${filename} in ${Date.now() - startMs}ms using the following command:\n> ${cmd}`)
			return stdout
		}

		log(`Skipping ${filename}`)
		return text
	} catch (e) {
		errorOut(`${e.shortMessage}\n${stripColor(e.stderr)}`)
		return text
	}
}
