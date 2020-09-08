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

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
	}

	getHiddenCount(tickets: Ticket[]) {
		return tickets.filter((t) => t.isHidden).length
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

		if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
			mybutton.style.display = "block";
		} else {
			mybutton.style.display = "none";
		}
	}


	renderTickets = (tickets: Ticket[]) => {


		const filteredTickets = tickets
			.filter((t) => (t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase()))
			.filter((t) => !t.isHidden);

		return (<ul className='tickets' >
			{filteredTickets.map((ticket) => <li  key={ticket.id} className='ticket' >
				<div className='header-container'>
					<h5 className='title'>{ticket.title}</h5>
					<a className='hide' onClick={ () => this.setTicketHidden(ticket, true)  }>Hide </a>
				</div>

				<body className={ ticket.isLess ? 'problemText' : 'problemText-less'} >
				{ticket.content}
				</body>

				<a className="problem-text-show-button" onClick={ () => this.flipTextLessMore(ticket) }> { ticket.isLess ? "Show Less" : "Show more" } </a>

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
				<button className='comment_button' onClick={ () => alert("FUCK!")}>Comment</button>


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

			<div className='results-container'>
			{tickets ? <div className='results'>Showing {tickets.length - this.getHiddenCount(tickets)} results</div> : null }
			{ tickets && this.getHiddenCount(tickets) > 0 ?
				<div className='results'>
					({this.getHiddenCount(tickets)} Hidden ticket{this.getHiddenCount(tickets) > 1 ? 's': ''} -
					<a onClick={ () => tickets.map( (t) => this.setTicketHidden(t, false) )}>restore</a>)
				</div> : null}
			</div>
			<button id="top-btn" className='Top_button-show'
					onClick={()=>this.Topfunction()}>Top</button>
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}

		</main>)
	};
}

export default App;