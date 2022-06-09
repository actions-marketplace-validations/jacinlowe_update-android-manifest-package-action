import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

process.on('unhandledRejection', handleError)
main().catch(handleError)

async function main(): Promise<void> {
    try {
        let printFile = getBooleanInput('print-file');
        let androidManifestPath = core.getInput('android-manifest-path');

        if (!fs.existsSync(androidManifestPath)) {
            core.setFailed(`The file path for the AndroidManifest.xml does not exist or is not found: ${androidManifestPath}`);
            process.exit(1);
        }

        let metadataKey = core.getInput('metadata-key');

        if (!metadataKey) {
            core.setFailed(`key not inserted: ${metadataKey}`);
            process.exit(1);
        }

        let metadataValue: string = core.getInput('metadata-value');
        if (!metadataValue) {
            core.setFailed(`value not inserted: ${metadataValue}`);
            process.exit(1);
        }

        if (printFile) {
            core.info('Before update:');
            await exec.exec('cat', [androidManifestPath]);
        }
        core.info('-----------n/------------')

        fs.chmodSync(androidManifestPath, "600");

        await fs.readFile(androidManifestPath, "utf-8", (err, data) => {
            if (err) {
                throw err;
            }

            // convert XML data to JSON object
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    throw err;
                }

                // const json = JSON.stringify(result, null, 4);
                // core.info(json)

                let TESTVALUE = null

                // Check in application
                const keyMatch = result.manifest.application[0]["meta-data"] ?? null;
                if (keyMatch) {
                    keyMatch.forEach((element, i) => {
                        if (element['$']['android:name'] === metadataKey) {
                            core.info(`Found Key in application: ${keyMatch[0]['$']['android:name']}`)
                            result.manifest.application[0]["meta-data"][i]['$']['android:value'] = metadataValue
                            TESTVALUE = result.manifest.application[0]["meta-data"][i]['$']['android:value']
                        }
                    });
                    // if (keyMatch[0]['$']['android:name'] === metadataKey) {
                    //     result.manifest.application[0]["meta-data"][0]['$']['android:value'] = metadataValue
                    // }
                }

                // Check in manifest
                else {
                    const key: Array<any> = result.manifest["meta-data"] ?? null
                    if (key) {
                        key.forEach((res, i) => {

                            if (res['$']['android:name'] === metadataKey) {
                                core.info(`Found Key in manifest: ${res['$']['android:name']}`)
                                result.manifest["meta-data"][i]['$']['android:value'] = metadataValue
                                TESTVALUE = result.manifest["meta-data"][i]['$']['android:value']
                            }

                        })
                    }
                }

                if (!TESTVALUE) {
                    // core.setFailed('Could not find or insert key')
                    const msg = 'Could not find or insert key'
                    throw handleError(err, msg)
                }
                core.info('-----------n/------------')


                // convert JSON object to XML
                const builder = new xml2js.Builder();
                const xml = builder.buildObject(result);

                // write updated XML string to a file
                fs.writeFile(androidManifestPath, xml, (err) => {
                    if (err) {
                        throw err;
                    }
                });

            });
        });

        if (printFile) {
            core.info('After update:');
            await exec.exec('cat', [androidManifestPath]);
        }

        core.info(`AndroidManifest.xml updated successfully`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

function handleError(err: any, msg?: string): void {
    if (!msg) {
        console.error(err)
        core.setFailed(`Unhandled error: ${err}`)
    }
    console.error(err)
    core.setFailed(`${msg}: ${err}`)

}

function getBooleanInput(inputName: string, defaultValue: boolean = false): boolean {
    return (core.getInput(inputName) || String(defaultValue)).toUpperCase() === 'TRUE';
}