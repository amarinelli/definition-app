import { createConnection } from "mysql2/promise";
import databaseConfig from "../config/database";
import { App } from "@slack/bolt";
import { confirmRemovalView, successfulRemovalView, errorModal } from "../slack-views/views";
import { checkForExistingTerm } from "./write";

export async function removeTerm(term: string): Promise<void> {

    const connection = await createConnection(databaseConfig);

    await connection.execute(
        'DELETE from definitions WHERE term = ?',
        [term]
    ).then((result) => {
        console.log(term);
        console.log(result);
        console.log('success!')
        connection.end();
        return Promise.resolve('Term Removed');
    }).catch((error) => {
        console.log(error);
        connection.end();
        return Promise.reject(error);
    });
}

export async function displayRemovalConfirmationModal(term: string, botToken: string, triggerID: string, viewID: string): Promise<void> {
    const app = new App({
        token: botToken,
        signingSecret: process.env.SLACK_SIGNING_SECRET
    });

    if (await checkForExistingTerm(term)) {

        app.client.views.update({
            token: botToken,
            view: confirmRemovalView(term),
            // eslint-disable-next-line @typescript-eslint/camelcase
            trigger_id: triggerID,
            // eslint-disable-next-line @typescript-eslint/camelcase
            view_id: viewID
        }).catch(error => {
            console.error(error);
        })
        return;
    }
    console.error('Unknown term');

    app.client.views.update({
        token: botToken,
        view: errorModal(),
        // eslint-disable-next-line @typescript-eslint/camelcase
        trigger_id: triggerID,
        // eslint-disable-next-line @typescript-eslint/camelcase
        view_id: viewID
    }).catch(error => {
        console.error(error);
    })

    return;


}

export function displaySuccessfulRemovalModal(term: string, botToken: string, triggerID: string): void {
    const app = new App({
        token: botToken,
        signingSecret: process.env.SLACK_SIGNING_SECRET
    });

    app.client.views.open({
        token: botToken,
        view: successfulRemovalView(term),
        // eslint-disable-next-line @typescript-eslint/camelcase
        trigger_id: triggerID,
    }).catch(error => {
        console.error(error);
    })

}