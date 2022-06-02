const chai = window.chai
const expect = chai.expect

// fonction qu'on veut tester

// valeur générale 
const label_1 = [121,247,376];
const label_2 = [251,496,750];
const label_3 = [102,209,312,434,559,673,787,893];
// fonction pour supprimer les labels, on supprime les labels dans un ordre aléatoire
function remove_label(label_const){
    var label = label_const.slice(); // on fait une copie de l'array qui contient les labels
    var coord = document.getElementById("left");
    console.log(coord.innerHTML);
    while(label.length >0){
        var item = label[Math.floor(Math.random()*label.length)]; // indice du label qu'on veut supprimer
        
        // pour supprimer un label, il faut d'abord passer la souris sur le label pour faire apparaître la croix, puis on supprime
        var element = document.getElementById(item); // on sélection le label 
        // l'event "souris au dessus du label"
        var event = new MouseEvent('mouseover', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        element.dispatchEvent(event); // exécution de l'event, la croix est maintenant dispo
        
        document.getElementById("cross_"+item).click(); // click sur la croix pour supprimer un label
    }
    console.log(coord.innerHTML);
    expect(coord.innerHTML).to.deep.equal("");
}

// function pour injecter un code html et check si les labels sont là
function add_label(){

}

describe('Supression de tous les labels pour 1.csv',() => {
    it('Il ne doit rester aucun label à la fin de ce test',(done) => {
        var label = label_1.slice(); // on fait une copie de l'array qui contient les labels
        var coord = document.getElementById("left");
        console.log(coord.innerHTML);
        while(label.length >0){
            var item = label[Math.floor(Math.random()*label.length)]; // indice du label qu'on veut supprimer
            // pour supprimer un label, il faut d'abord passer la souris sur le label pour faire apparaître la croix, puis on supprime
            var element = document.getElementById(item); // on sélection le label 
            // l'event "souris au dessus du label"
            var event = new MouseEvent('mouseover', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            console.log(element);
            element.dispatchEvent(event); // exécution de l'event, la croix est maintenant dispo
            
            document.getElementById("cross_"+item).click(); // click sur la croix pour supprimer un label
        }
        console.log(coord.innerHTML);
        expect(coord.innerHTML).to.deep.equal("");
        done();
    })
})