import { Component, OnInit } from '@angular/core';
import { DbService } from '../services/db.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Pessoa } from '../services/pessoa';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  listaPessoas = [];

  form: FormGroup = this.fb.group({
    nome: [],
    email: []
  });

  constructor(private db: DbService, private fb: FormBuilder) {}


  ngOnInit() {
    this.db.dbState().subscribe(res => {
      if (res) {
        this.db.fetchPessoas().subscribe(pessoas => {
          this.listaPessoas = pessoas;
          console.log(pessoas);
        });
      } else {
        console.log(res);
      }
    });
  }


  salvar() {
    const {nome, email} = this.form.value;
    // console.log(nome, email);
    this.db.addPessoa(nome, email).then(r => {
      console.log('salvo com sucesso', r);

      this.listarPessoas();
    });
  }

  editar(p: Pessoa) {
    console.log('editar', p);
  }

  excluir(p: Pessoa) {
    console.log('excluir', p);
  }


  listarPessoas() {
    this.db.fetchPessoas().subscribe(res => {
      console.log(res);
      this.listaPessoas = res;
    });
  }


}
