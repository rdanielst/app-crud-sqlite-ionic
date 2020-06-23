import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Pessoa } from './pessoa';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  pessoaList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);


  databaseObj: SQLiteObject;
  readonly databaseName: string = 'pessoas_db.db';
  readonly tableName: string = 'pessoatable';


  constructor(
    private platform: Platform,
    private sqlite: SQLite,
  ) {

    this.platform.ready().then(() => {
      this.createDB();

      this.getPessoas();
    }).catch(error => console.log(error));

  }

  public getDB() {
    return this.sqlite.create({
      name: this.databaseName,
      location: 'default'
    });
  }


  // Cria o banco caso não exista
  createDB() {
    this.getDB()
      .then((db: SQLiteObject) => {
        this.databaseObj = db;
        alert('DB Criado com sucesso!');
        this.createTable();
      })
      .catch(e => {
        alert('error ' + JSON.stringify(e));
      });
  }

  // Cria a tabela
  createTable() {

    this.getDB().then((db: SQLiteObject) => {

      db.executeSql(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, nome varchar(255), email varchar(255))
      `, [])
        .then(() => {
          console.log('Tabela criada');
        })
        .catch(e => {
          alert('error ' + JSON.stringify(e));
        });

    }).catch(error => console.log('error', error));

  }



  dbState() {
    return this.isDbReady.asObservable();
  }


  fetchPessoas(): Observable<Pessoa[]> {
    return this.pessoaList.asObservable();
  }


  // Retorna a listagem de pessoas
  async getPessoas(){
    return await this.getDB().then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM pessoatable', []).then(res => {
        const items: Pessoa[] = [];
        if (res.rows.length > 0) {
          for (let i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              nome: res.rows.item(i).nome,
              email: res.rows.item(i).email
             });
          }
        }
        this.pessoaList.next(items);
      });

    });
  }


  // Adiciona Pessoas
  async addPessoa(nome: string, email: string) {

    const data = [nome, email];
    const sql = `INSERT INTO ${this.tableName} (nome, email) VALUES (?, ?)`;

    return await this.getDB().then((db: SQLiteObject) => {

      db.executeSql(sql, data)
      .then(res => {
        this.getPessoas();
      }).catch(error => console.log(error));
    }).catch(error => console.log(error));
  }


  // Get uma Pessoa
  async getPessoa(id: number): Promise<any> {

    return await this.getDB().then((db: SQLiteObject) => {
      db.executeSql('SELECT * FROM pessoatable WHERE id = ?', [id]).then(res => {

        return {
          id: res.rows.item(0).id,
          nome: res.rows.item(0).nome,
          email: res.rows.item(0).email
        };
      });
    });

  }

   // Update
   async update(id, p: Pessoa) {
    const data = [p.nome, p.email];

    return await this.getDB().then((db: SQLiteObject) => {
      db.executeSql(`UPDATE pessoatable SET nome = ?, email = ? WHERE id = ${id}`, data)
      .then(() => {
        this.getPessoas();
      });
    });
  }


  // Delete
  async delete(id: number) {

    return await this.getDB().then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM pessoatable WHERE id = ?', [id])
      .then(() => {
        this.getPessoas();
      });
    });
  }


}
