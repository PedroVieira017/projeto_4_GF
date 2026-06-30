export type MockParticipante = {
  id_utilizador: string;
  nome_completo: string;
  email_interno: string;
  uo_id: number;
  uo_nome: string;
  n_formacoes?: number;
};

export const MOCK_PARTICIPANTES: MockParticipante[] = [
  { id_utilizador: 'kbridle0', nome_completo: 'Kin Bridle', email_interno: 'kbridle0@state.tx.us', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'opindred1', nome_completo: 'Orelia Pindred', email_interno: 'opindred1@unblog.fr', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'smeadway2', nome_completo: 'Sutton Meadway', email_interno: 'smeadway2@kickstarter.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'ayedall3', nome_completo: 'Alysa Yedall', email_interno: 'ayedall3@guardian.co.uk', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'omachans4', nome_completo: 'Odelia Machans', email_interno: 'omachans4@bloomberg.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'maveray5', nome_completo: 'Mercedes Averay', email_interno: 'maveray5@abc.net.au', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'cgodard6', nome_completo: 'Christina Godard', email_interno: 'cgodard6@yellowbook.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'pschowenburg7', nome_completo: 'Parsifal Schowenburg', email_interno: 'pschowenburg7@cafepress.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'pvan8', nome_completo: 'Patty Van Giffen', email_interno: 'pvan8@goo.ne.jp', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'astrain9', nome_completo: 'Ashlan Strain', email_interno: 'astrain9@domainmarket.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'jveleza', nome_completo: 'Jasen Velez', email_interno: 'jveleza@dot.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'vvanb', nome_completo: 'Vachel Van Baaren', email_interno: 'vvanb@arizona.edu', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'zdrewsc', nome_completo: 'Zachary Drews', email_interno: 'zdrewsc@devhub.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'dbarzd', nome_completo: 'Darbie Barz', email_interno: 'dbarzd@sphinn.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'elanchburye', nome_completo: 'Essie Lanchbury', email_interno: 'elanchburye@admin.ch', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'fsammutf', nome_completo: 'Florida Sammut', email_interno: 'fsammutf@github.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'cunderwoodg', nome_completo: 'Chantalle Underwood', email_interno: 'cunderwoodg@state.tx.us', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'bcrownshawh', nome_completo: 'Batsheva Crownshaw', email_interno: 'bcrownshawh@va.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'ftofpiki', nome_completo: 'Fredi Tofpik', email_interno: 'ftofpiki@blogger.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'mmillhousej', nome_completo: 'Mirabella Millhouse', email_interno: 'mmillhousej@usda.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'pmcnirlank', nome_completo: 'Peirce McNirlan', email_interno: 'pmcnirlank@tamu.edu', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'ahebronl', nome_completo: 'Ari Hebron', email_interno: 'ahebronl@chronoengine.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'melvishm', nome_completo: 'Muhammad Elvish', email_interno: 'melvishm@wikia.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'lkendrewn', nome_completo: 'Lay Kendrew', email_interno: 'lkendrewn@ucoz.ru', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'jbolsovero', nome_completo: 'Jewelle Bolsover', email_interno: 'jbolsovero@eventbrite.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'hjanczewskip', nome_completo: 'Harwilll Janczewski', email_interno: 'hjanczewskip@cam.ac.uk', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'djorinq', nome_completo: 'Delmore Jorin', email_interno: 'djorinq@gnu.org', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'lmaylerr', nome_completo: 'Laughton Mayler', email_interno: 'lmaylerr@dell.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'vgrzelaks', nome_completo: 'Vera Grzelak', email_interno: 'vgrzelaks@xinhuanet.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'dcicculinit', nome_completo: 'Doro Cicculini', email_interno: 'dcicculinit@ustream.tv', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'acaponu', nome_completo: 'Ancell Capon', email_interno: 'acaponu@desdev.cn', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'hantoninv', nome_completo: 'Horst Antonin', email_interno: 'hantoninv@apache.org', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'czukiermanw', nome_completo: 'Charlotte Zukierman', email_interno: 'czukiermanw@loc.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'flatourx', nome_completo: 'Francisco Latour', email_interno: 'flatourx@people.com.cn', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'khellicary', nome_completo: 'Kendricks Hellicar', email_interno: 'khellicary@networksolutions.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'jgarmonsz', nome_completo: 'Jereme Garmons', email_interno: 'jgarmonsz@nhs.uk', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'bconnue10', nome_completo: 'Bancroft Connue', email_interno: 'bconnue10@wsj.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'preilly11', nome_completo: 'Patten Reilly', email_interno: 'preilly11@imgur.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'jforsbey12', nome_completo: 'Joshia Forsbey', email_interno: 'jforsbey12@flickr.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'gwaldie13', nome_completo: 'Giselbert Waldie', email_interno: 'gwaldie13@cdc.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'gmcilhone14', nome_completo: 'Glyn McIlhone', email_interno: 'gmcilhone14@ifeng.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'jfrangleton15', nome_completo: 'Jenni Frangleton', email_interno: 'jfrangleton15@discuz.net', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'rlahive16', nome_completo: 'Rustin Lahive', email_interno: 'rlahive16@house.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'pboston17', nome_completo: 'Pearla Boston', email_interno: 'pboston17@topsy.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'dliveley18', nome_completo: 'Donnamarie Liveley', email_interno: 'dliveley18@who.int', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'lragbourn19', nome_completo: 'Linnet Ragbourn', email_interno: 'lragbourn19@mapquest.com', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'sdelort1a', nome_completo: 'Say Delort', email_interno: 'sdelort1a@usda.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'vseeborne1b', nome_completo: 'Valerye Seeborne', email_interno: 'vseeborne1b@census.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'rsarah1c', nome_completo: 'Rodney Sarah', email_interno: 'rsarah1c@privacy.gov.au', uo_id: 1, uo_nome: 'Escola Superior Agrária' },
  { id_utilizador: 'obrimble1d', nome_completo: 'Ofella Brimble', email_interno: 'obrimble1d@census.gov', uo_id: 1, uo_nome: 'Escola Superior Agrária' }
];
