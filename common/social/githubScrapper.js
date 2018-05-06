const AXIOS = require('axios');

function  getGithubDetails(username, token){	
    let bearer = "Bearer "+token;
    //{Authorization:"Bearer "+token}
    const axios_instance = AXIOS.create({baseURL:'https://api.github.com/',headers:{Authorization:bearer}});

    let user_request = getUserInfo(username, axios_instance);
    let repos_request = getRepositoriesInfo(username, axios_instance);
    let commits_request = getCommitsInfo(username, axios_instance);
    
    return Promise.all([user_request, repos_request, commits_request])
    .then( ([user_response, repos_response, commits_response]) => {
        
        for(let repo_name in commits_response){
	    if(!repos_response.repos[repo_name]){
		repos_response.repos[repo_name] = {};
	    }
	    repos_response.repos[repo_name].commits = commits_response[repo_name].commits;
        }
        if(user_response != null){
	    user_response.repos = repos_response;
        }
        return user_response;
    });
}

function getUserInfo(username, axios) {
    const user_url = 'users/'+username;
    return axios.get(user_url)
    .then(r => {
        return {
        bio: r.data.bio,
        followers: r.data.followers,
        company: r.data.company,
        location: r.data.location,
        created_at: r.data.created_at
        }
    })
    .catch(e => {
        console.log('exception 1',e.message, e.response.data.message);
        return null;
    });
}

function getRepositoriesInfo(username, axios) {
    const repos_url = 'users/'+ username + '/repos';
    return axios.get(repos_url)
    .then(r => {
        let repos_data = {repos_count: r.data.length, repos: {}};
        return Promise.all(r.data.map(repo => {
    repos_data.repos[repo.full_name] = {name:repo.name, description:repo.description, fork:repo.fork, commits:[]};
    let languages_request = axios.get('repos/'+repo.full_name+'/languages')
        .then(r => r.data)
        .catch(e=>{
        console.log('exception a',e.message);
        return null;
        });
    let topics_request = axios.get('repos/'+repo.full_name+'/topics',{headers:{Accept:'application/vnd.github.mercy-preview+json'}})
        .then(r => {
        return r.data;
        })
        .catch(e=>{
        console.log('exception b',e.message);
        return null;
        });
    let readme_request = axios.get('repos/'+repo.full_name+'/readme')
        .then(r => {
        if(r.data.encoding == 'base64'){
            return Buffer.from(r.data.content,'base64').toString('utf8');						
        }
        else{
            console.log('unknown encoding',r.data.encoding);
            return Buffer.from(r.data.content,r.data.encoding).toString('utf8');
        }
        })
        .catch(e=> {
        console.log('exception c',e.message)
        return null;
        });
    
    return Promise.all([languages_request, topics_request, readme_request])
        .then(([languages, topics, readme]) => {
        repos_data.repos[repo.full_name].languages = languages;
        repos_data.repos[repo.full_name].topics = topics;
        repos_data.repos[repo.full_name].readme = readme;
        });
        })).then(()=>repos_data);
    })
    .catch(e => {
        log_exception(e);
        return null;
    });
}

function getCommitsInfo(username, axios) {
    const commits_url = 'search/commits?q=author:' + username;

    return  axios.get(commits_url, {headers:{Accept:'application/vnd.github.cloak-preview'}})
    .then(r => {
        let commits = {};
        r.data.items.forEach(item => {
        if(!commits[item.repository.full_name]){
	commits[item.repository.full_name] = {commits:[]};
        }
        commits[item.repository.full_name].commits.push(item.commit.message);
        });
        return commits;
        
    })
    .catch(e => {
    log_exception(e);
        return null;
    });
}
function getReposLanguages()
{
    //get all file list
    //skip unnecessary
    //get extension of leftover
    
}

function log_exception (e){
    console.log('exception:', e.message, e.response && e.response.data ? e.response.data.message:null);
}
module.exports = getGithubDetails;