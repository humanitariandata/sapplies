var categories = [
{   name: "Algemeen"}, {   name: "Kleding"}, {   name: "Babyhygiëne"}, {   name: "Food",}, {   name: "Electronica",}, {   name: "Maaltijden"}, {   name: "Meubilair"}, {   name: "Thuis"}, {   name: "Gereedschap"}, {   name: "Speelgoed"}, {   name: "Onderdak"}, {   name: "Elektricien"}, {   name: "Loodgieter"}, {   name: "Bouw",}, {   name: "Financieel"}, {   name: "Juridische"}, {   name: "Medische begeleiding"}, {   name: "Vertaling"}, {   name: "Vervoer"}, {   name: "Generator"}
]

// type: Dienst of Goederen
var needs = [
   { title : "Helpen met klussen", description : "Er is iemand nodig om te helpen met klussen.", category : "Bouw", type: "Dienst" },
   { title : "Tweepersoonsbank", description : "Het liefst een bank die ook te demonteren is.", category : "Meubilair", type: "Goederen" }
]

var offers = [
   { title: "Ik kan helpen met het leggen van laminaat", description: "Op woensdagen zou ik kunnen komen helpen", category: "Bouw", type: "Dienst"},
   { title: "Leren fauteuil met uiklapbaar voetenbankje", description: "Weegt ongeveer 15kg in de kleur bruin", category: "Meubilair", type: "Goederen"}
]

// Mongo shell
db.categories.remove({})
db.needs.remove({})
db.offers.remove({})
