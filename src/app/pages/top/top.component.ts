import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MainService } from '../../services/main.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent implements OnInit {

  	constructor(private MainService: MainService, private http: HttpClient) {}

  	sortedRank;
  	eos = this.MainService.returnEosNet();
	tableLoader = false;

	getTableWinners(){
		this.tableLoader = true;	
		this.http.get('/api/v1/top100')
				 .subscribe((res: any) => {
				 	this.sortedRank = res;
				 	this.tableLoader = false;
				 }, (err) => {
				 	this.tableLoader = false;
				 	console.error(err);
				 });
	}

  ngOnInit() {
  	this.getTableWinners();
  }

}
