import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';

import * as fs from 'fs';

export type AppState = {
	tickets?: Ticket[],
	search: string,

}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: ''

	};

	searchDebounce: any = null;
	sortByNewDate: boolean = true;

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	getHiddenCount(tickets: Ticket[]) {
		return tickets.filter((t) => t.isHidden).length
	}
	getSearchCount(tickets: Ticket[]) {
		return tickets.filter((t) =>
		(t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase())).length
	}


	setTicketHidden(ticket: Ticket, state: boolean) {
		ticket.isHidden = state;
		this.forceUpdate()
	}

	flipTextLessMore(ticket: Ticket) {
		ticket.isLess = !ticket.isLess;
		this.forceUpdate();
	}
	Topfunction (){
			document.body.scrollTop = 0; // For Safari
			document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
			this.forceUpdate();
	}
	scrollFunction() {
		let mybutton = document.getElementById("top-btn");
		if (mybutton === null) {
			return;
		}

		if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
			mybutton.style.display = "block";
		} else {
			mybutton.style.display = "none";
		}
	}
	showbackfunction(){
		let mybutton = document.getElementById("back_button");
		if (mybutton === null)
			return;
		mybutton.style.display="inline";
		return;
	}
	hidebackfunction(){
		let mybutton = document.getElementById("back_button");
		if (mybutton === null)
			return;
		mybutton.style.display="none";
		return;
	}

	switchSort() {
		this.sortByNewDate = !this.sortByNewDate;
		this.forceUpdate();
	}





	renderTickets = (tickets: Ticket[]) => {


		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()))
			.filter((t) => !t.isHidden);

		/* Sort tickets by date */
		filteredTickets.sort((t1: Ticket, t2: Ticket) => {
			if (this.sortByNewDate) {
				return t2.creationTime - t1.creationTime;
			}
			return t1.creationTime - t2.creationTime;;
		});


		return (<ul className='tickets' >
			{filteredTickets.map((ticket) => <li  key={ticket.id} className='ticket' >
				<div className='header-container'>
					<h5 className='title'>{ticket.title}</h5>
					<a className='hide' onClick={ () => this.setTicketHidden(ticket, true)  }>Hide </a>
				</div>

				<body className={ ticket.isLess ? 'problemText' : 'problemText-less'} >
				{ticket.content}
				</body>

				<a className="problem-text-show-button"  onClick={ () => this.flipTextLessMore(ticket) }> { ticket.isLess ? "Show Less" : "Show more" } </a>

				<footer className="boxed-container" >

					{!!ticket.labels &&
					ticket.labels.map( (l) =>
					<ul className='boxed'>{l.toString()}

					</ul>
					)
					}
					<div
						className='meta-data'>By {ticket.userEmail} | {new Date(ticket.creationTime).toLocaleString()}</div>
				</footer>



			</li>)}
		</ul>);
	};


	onSearch = async (val: string, newPage?: number) => {
		
		clearTimeout(this.searchDebounce);
		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val
			});
		}, 300);
	};

	render() {
		document.body.onscroll = this.scrollFunction;
		const {tickets} = this.state;



		return (<main>
			<h1>Tickets List</h1>
			<header >
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			<div>
				<button id='back_button' className='hash_button' style={{display:"none" }} onClick={ () => {this.setState({search:''}) ; this.hidebackfunction()}}>⬅</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'important'}) ; this.showbackfunction()}}>Important</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'css'}) ; this.showbackfunction()}}>css</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'database'}) ; this.showbackfunction()}}>Database</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'corvid'}) ; this.showbackfunction()}}>#Corvid</button>


			</div>
			<div className='results-container'>
			{tickets ? <div className='results'>Showing {this.getSearchCount(tickets) - this.getHiddenCount(tickets)} results</div> : null }
			{ tickets && this.getHiddenCount(tickets) > 0 ?
				<div className='results'>
					({this.getHiddenCount(tickets)} Hidden ticket{this.getHiddenCount(tickets) > 1 ? 's': ''} -
					<a onClick={ () => tickets.map( (t) => this.setTicketHidden(t, false) )}>restore</a>)
				</div> : null}
				<div className="sort-by">
					<div className="toggle-container" onClick={() => this.switchSort()}>
						<div className={`dialog-button ${this.sortByNewDate ? "" : "disabled"}`}>
							{this.sortByNewDate ? "NEW " : "OLD"}
						</div>
					</div>
				</div>
			</div>
			<button id="top-btn" style={{display:"none"}} className='Top_button-show'
					onClick={()=>this.Topfunction()}>⬆</button>
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}

		</main>)
	};
}

export default App;