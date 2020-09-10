import React from 'react';
import './App.scss';
import {createApiClient, Ticket} from './api';


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
	allTickets: Ticket[] | undefined = [];

	async componentDidMount() {
		this.setState({
			tickets: await api.getTickets()
		});
		this.allTickets = this.state.tickets;
	}
	/**
	 * gets the number of thickets which are hidden
	 * @param  {Tickets} the array of the tickets
	 * @return {Number}   The length of the filter array which contains the hidden tickets
	 */
	getHiddenCount(tickets: Ticket[]) {
		return tickets.filter((t) => t.isHidden).length
	}
	/**
	 * gets the number of thickets which appear in the search
	 * @param  {Tickets} the array of the tickets
	 * @return {Number}   The length of the filter array which contains the searched tickets
	 */
	getSearchCount(tickets: Ticket[]) {
		return tickets.filter((t) =>
		(t.title.toLowerCase() + t.content.toLowerCase()).includes(this.state.search.toLowerCase())).length
	}
	/**
	 * Hides / unHides the ticket
	 * @param  {Ticket} the ticket
	 * @param  {State} true for hidden false for show
	 * The function will re render the content
	 * @return void
	 */
	setTicketHidden(ticket: Ticket, state: boolean) {
		ticket.isHidden = state;
		this.forceUpdate()
	}

	/**
	 * shows / unshows the whole ticket content
	 * @param  {Ticket} the ticket
	 * The function will re render the content
	 * @return void
	 */
	flipTextLessMore(ticket: Ticket) {
		ticket.isLess = !ticket.isLess;
		this.forceUpdate();
	}

	/**
	 * Scrolls back to the top of the page
	 * @return void
	 */
	Topfunction (){
			document.body.scrollTop = 0; // For Safari
			document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
			this.forceUpdate();
	}
	/**
	 * Check if the back to top button needs to show / hide
	 * @return void
	 */
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
	/**
	 * If some category is selected will show the back button
	 * @return void
	 */
	showbackfunction(){
		let mybutton = document.getElementById("back_button");
		if (mybutton === null)
			return;
		mybutton.style.display="inline";
		return;
	}

	/**
	 * If back button is pressed hide the back button
	 * @return void
	 */
	hidebackfunction(){
		let mybutton = document.getElementById("back_button");
		if (mybutton === null)
			return;
		mybutton.style.display="none";
		this.setState({
			tickets: this.allTickets
		});
		return;
	}

	/**
	 * Switches the order of the tickets from new to old or back
	 * @return void
	 */
	switchSort() {
		this.sortByNewDate = !this.sortByNewDate;
		this.forceUpdate();
	}

	/**
	 * Gets all of the labels name from the data
	 * @param  {Tickets} the array of tickets
	 * @return string array of all the labels
	 */
	getAllLabels(tickets: Ticket[]):string[]  {
		let labels = new Set();
		let ticket: Ticket;

		for (ticket of tickets) {
			if (ticket && ticket.labels) {
				ticket.labels.map((l) => labels.add(l));
			}
		}
		// @ts-ignore
		return Array.from(labels);
	}
	/**
	 * Updates the tickets state to show only the label selected
	 * @param  {Tickets} the array of tickets
	 * @param  {label} the label name
	 * @return void
	 */
	showOnlyLabels(tickets: Ticket[], label: string) {
		let ticket: Ticket;
		let newTickets: Ticket[] = [];

		for (ticket of tickets) {
			if (ticket && ticket.labels && ticket.labels.includes(label)) {
				newTickets.push(ticket);
			}

		}
		this.setState({
			tickets: newTickets
		});
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
			return t1.creationTime - t2.creationTime;
		});


		return (<ul className='tickets' >
			{filteredTickets.map((ticket) => <li  key={ticket.id} className='ticket' >
				<div className='header-container'>
					<h5 className='title'>{ticket.title}</h5>
					<a className='hide' href="#/" onClick={ () => this.setTicketHidden(ticket, true)  }>Hide </a>
				</div>

				<div className={ ticket.isLess ? 'problemText' : 'problemText-less'} >
				{ticket.content}
				</div>

				<a className="problem-text-show-button" href="#/" style={{display:ticket.content.length>10 ? "inline" : "none"}}  onClick={ () => this.flipTextLessMore(ticket) }> { ticket.isLess ? "Show Less" : "Show more" } </a>

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
		const labels: string[] = this.getAllLabels(tickets ? tickets : []);


		return (<main>
			<h1>Tickets List</h1>
			<header >
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)}/>
			</header>
			<div>
				<button id='back_button' className='hash_button' style={{display:"none", fontSize: "12px"}} onClick={ () => {this.setState({search:''}) ; this.hidebackfunction()}}>⬅</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'important'}) ; this.showbackfunction()}}>Important</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'css'}) ; this.showbackfunction()}}>css</button>
				<button className='hash_button' onClick={ () => {this.setState({search:'database'}) ; this.showbackfunction()}}>Database</button>

				{	labels.map((label) =>
					<button className='hash_button'
							onClick={() => {
								this.showOnlyLabels(tickets ? tickets : [], label);
								this.showbackfunction()
							}}>
						#{label}
					</button>
				)}


			</div>
			<div className='results-container'>

			{tickets ? <div className='results-left' >
				Showing {this.getSearchCount(tickets) - this.getHiddenCount(tickets)} results  &nbsp;&nbsp;

				{ tickets && this.getHiddenCount(tickets) > 0 ?
					<div>
						({this.getHiddenCount(tickets)} Hidden ticket{this.getHiddenCount(tickets) > 1 ? 's': ''} -
						<a href="#/" onClick={ () => tickets.map( (t) => this.setTicketHidden(t, false) )}>restore</a>)
					</div> : null}
			</div> : null }
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