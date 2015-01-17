
// Random bg image.
var bg = Math.floor(Math.random()*4);
document.body.style.backgroundImage="url('../img/bg"+bg+".jpg')";

// React App.
var App = React.createClass({
  getInitialState: function() {
    return {data: [], formVisible: false, alertActive: false};
  },
  componentDidMount: function() {
    var data = JSON.parse(localStorage.getItem('countdowns'));
    this.setState({data: this.sortData(data)});
  },
  deleteData: function(index) {
    var newData = this.state.data;
    newData.splice(index, 1);
    localStorage.setItem('countdowns', JSON.stringify(newData));
    this.setState({data: newData});
  },
  postData: function(title, dateMs) {
    // Stringify all and update localstorage.
    var newData = this.state.data;
    newData.push({'date': dateMs, 'title': title});
    localStorage.setItem('countdowns', JSON.stringify(newData));
    this.setState({data: this.sortData(newData), formVisible: !this.state.formVisible, 
      alertActive: true});
  },
  toggleForm: function() {
    // Update state.
    var formVisible = !this.state.formVisible;
    this.setState({formVisible: !this.state.formVisible});
  },
  sortData: function(data) {
    data.sort(function(a,b) {
      if (a.date < b.date) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      }
      return 0;
    });
    return data;
  },
  render: function() {
    // Render correct view depending on state.
    if (!this.state.formVisible && !this.state.alertActive) {
      return (
        <div className='app'>
          <AddButton onButtonClick={this.toggleForm} />
          <CountdownList data={this.state.data} onCountdownDelete={this.deleteData}/>
        </div>
      );
    } else if (!this.state.formVisible) {
      // Delete alert after 3 secs.
      var that = this;
      window.setTimeout(function(){
        that.setState({alertActive: false}); 
      }, 3000)
      return (
        <div className='app'>
          <Alert />
          <AddButton onButtonClick={this.toggleForm} />
          <CountdownList data={this.state.data} onCountdownDelete={this.deleteData}/>
        </div>
      );
    } else {
      return (
        <div className='app'>
          <AddForm onAbortClick={this.toggleForm} onSubmit={this.postData} />
        </div>
      );
    }
  }
});

var AddButton = React.createClass({
  handleButtonClick: function(e) {
    this.props.onButtonClick();
  },
  render: function() {
    return (
      <span className='navButton' onClick={this.handleButtonClick}>+</span>
    );
  }
});

var AddForm = React.createClass({
  componentDidMount: function() {
    $('.datepicker').pickadate();
  },
  handleAbort: function(e) {
    this.props.onAbortClick();
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var title = this.refs.title.getDOMNode().value.trim();
    var dateString = this.refs.date.getDOMNode().value.trim();
    var dateMs = this.dateStringToMs(dateString);
    // Call App's handler.
    this.props.onSubmit(title, dateMs) 
  },
  dateStringToMs: function(string) {
    var monthMap = {'January':0, 'February':1, 'March':2, 'April':3, 'May':4, 'June':5, 'July':6, 
                    'August':7, 'September':8, 'October':9, 'November':10, 'December': 11};
    var dateRegex = /(\d{1,2})\s(January|February|March|April|May|June|July|August|September|October|November|December),\s(\d{4})/g;
    var match = dateRegex.exec(string);
    var date = new Date(match[3], monthMap[match[2]], match[1]);
    return date.getTime();
  },
  render: function() {
    return (
      <div className='addForm'>
        <form onSubmit={this.handleSubmit}>
          <input type='text' className='input input-lg form-control' placeholder='what?' ref='title' />
          <input type='text' className='datepicker input input-lg form-control' placeholder='when?' ref='date' />
          <button className='btn btn-lg btn-block btn-success'>Add</button>
          <span className='navButton' onClick={this.handleAbort}>&#60;</span>
        </form>
      </div>
    );
  }
});

var CountdownList = React.createClass({
  handleCountdownDelete: function(index) {
    // Call App's delete.
    this.props.onCountdownDelete(index);
  },
  render: function() {
    var that = this;
    var countdownNodes = this.props.data.map(function(countdown, index){
      return (
        <CountdownItem key={index} onCountdownDelete={that.handleCountdownDelete} 
          data={countdown} index={index}/>
      );
    });
    return (
      <div className='countdownList'>
        {countdownNodes}
      </div>
    );
  }
});

var CountdownItem = React.createClass({
  handleDelete: function(e) {
    // Call CountdownList's delete.
    this.props.onCountdownDelete(this.props.index);
  },
  getDays: function(dateMs) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    var timeDelta = Math.floor((dateMs - date.getTime())/86400000);
    return timeDelta;
  },
  render: function() {
    var timeDelta = this.getDays(this.props.data.date);
    if (timeDelta === 0) {
      return (
        <div className='countdown row today'>
          <div className='col-xs-5'>
            <span className='daysLeftCount'>Today</span>
          </div>
          <div className='col-xs-7'>
            <h3>{this.props.data.title}</h3>
          </div>
          <span className='deleteButton' onClick={this.handleDelete}>X</span>
        </div>
      );
    } else {
      return (
        <div className='countdown row'>
          <div className='col-xs-5'>
            <span className='daysLeftCount'>{timeDelta}</span>
            <span className='daysLeftText'>days left</span>
          </div>
          <div className='col-xs-7'>
            <h3>{this.props.data.title}</h3>
          </div>
          <span className='deleteButton' onClick={this.handleDelete}>X</span>
        </div>
      );
    }
  }
});

var Alert = React.createClass({
  render: function() {
    return (
      <div className="alert">
        <strong>Awesome!</strong> Your countdown was added!
      </div>
    );
  }
});

React.render(
  <App />,
  document.getElementById('reactRoot')
);
