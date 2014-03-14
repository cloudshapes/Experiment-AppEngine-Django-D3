


function deleteTD(_itemTitle, _deleteUrl)	{
	// Check they wish to delete the object
 	if (!confirm("Are you sure you want to delete the \'"+_itemTitle+"\' text display item ?")) 
 		return;

	window.location.href = _deleteUrl;
}




