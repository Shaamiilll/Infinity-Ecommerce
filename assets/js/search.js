$(document).ready(function () {
    // When the user types in the search box
    $("#name-search").on("keyup", function () {
        var searchText = $(this).val().toLowerCase();

        // Loop through each table row
        $("table tbody tr").each(function () {
            var id = $(this).find("td:eq(0)").text().toLowerCase();
            var userName = $(this).find("td:eq(1)").text().toLowerCase(); 
            var email = $(this).find("td:eq(2)").text().toLowerCase(); 
            var block=$(this).find("td:eq(5)").text().toLowerCase()
       
            if (userName.includes(searchText)) {
                $(this).show();
            }else if(id.includes(searchText)){
                $(this).show();
            }else if(email.includes(searchText)){
                $(this).show();
            }else if(block.includes(searchText)){
                $(this).show();
            }else{
                $(this).hide();
            }
        });
    });
});