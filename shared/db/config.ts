import { Database } from 'sqlite3';
import { open } from 'sqlite';

// db 연결을 관리하는 함수
let dbInstance: any = null;

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: './database.sqlite',
            driver: Database
        });
    }
    return dbInstance;
}
